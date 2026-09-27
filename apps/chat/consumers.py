import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import Conversation, Message


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.room_group_name = f"chat_{self.conversation_id}"
        self.group_joined = False

        user = self.scope.get("user")

        if not user or not user.is_authenticated:
            await self.close(code=4001)
            return

        is_member = await self.check_conversation_member(
            user.id,
            self.conversation_id,
        )

        if not is_member:
            await self.close(code=4003)
            return

        try:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name,
            )

            self.group_joined = True
            await self.accept()

        except Exception:
            await self.close(code=1011)

    async def disconnect(self, close_code):
        if getattr(self, "group_joined", False):
            try:
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name,
                )

            except Exception:
                pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(
                text_data=json.dumps({
                    "error": "Invalid JSON."
                })
            )
            return

        content = data.get("content")

        if not content or not str(content).strip():
            await self.send(
                text_data=json.dumps({
                    "error": "Message content is required."
                })
            )
            return

        user = self.scope["user"]

        try:
            message = await self.create_message(
                user.id,
                self.conversation_id,
                str(content).strip(),
            )

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                },
            )

        except Exception:
            await self.send(
                text_data=json.dumps({
                    "error": "Failed to send message."
                })
            )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(event["message"])
        )

    @database_sync_to_async
    def check_conversation_member(
        self,
        user_id,
        conversation_id,
    ):
        return (
            Conversation.objects.filter(
                id=conversation_id,
                buyer_id=user_id,
            ).exists()
            or
            Conversation.objects.filter(
                id=conversation_id,
                owner_id=user_id,
            ).exists()
        )

    @database_sync_to_async
    def create_message(
        self,
        user_id,
        conversation_id,
        content,
    ):
        conversation = Conversation.objects.get(
            id=conversation_id,
        )

        message = Message.objects.create(
            conversation=conversation,
            sender_id=user_id,
            content=content,
        )

        conversation.save(
            update_fields=["updated_at"],
        )

        return {
            "id": message.id,
            "conversation": conversation.id,
            "sender": user_id,
            "content": message.content,
            "is_read": message.is_read,
            "created_at": message.created_at.isoformat(),
        }