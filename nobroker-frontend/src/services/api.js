const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export { API_BASE_URL };

export const API_ORIGIN = API_BASE_URL;

// ============================================================
// GET PROPERTIES
// ============================================================

export async function getProperties(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      query.append(key, value);
    }
  });

  const url = `${API_BASE_URL}/api/properties/${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }

  return response.json();
}

// ============================================================
// GET SINGLE PROPERTY
// ============================================================

export async function getProperty(propertyId) {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}/`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch property");
  }

  return response.json();
}

// ============================================================
// OWNER DASHBOARD
// ============================================================

export async function getMyProperties(token) {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/mine/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch your properties");
  }

  return response.json();
}

export async function getOwnerInterests(token) {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/interests/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch incoming interests");
  }

  return response.json();
}

// ============================================================
// UPDATE INTEREST STATUS
// ============================================================

export async function updateInterestStatus(
  token,
  interestId,
  status
) {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/interests/${interestId}/`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data.detail || "Failed to update interest status."
    );
  }

  return response.json();
}

// ============================================================
// DEALS
// ============================================================

export async function getDeals(token) {
  const response = await fetch(`${API_BASE_URL}/api/deals/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch deals");
  }

  return response.json();
}

export async function createDeal(
  token,
  interestRequest,
  agreedPrice
) {
  const response = await fetch(
    `${API_BASE_URL}/api/deals/create/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        interest_request: interestRequest,
        agreed_price: agreedPrice,
      }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.detail || "Failed to create deal"
    );
  }

  return data.deal;
}

export async function updateDeal(token, dealId, status) {
  const response = await fetch(
    `${API_BASE_URL}/api/deals/${dealId}/`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.detail || "Failed to update deal"
    );
  }

  return data.deal;
}

// ============================================================
// CHAT
// ============================================================

export async function getConversations(token) {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversations/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }

  return response.json();
}
