import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

export const config = {
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
};


export const handleLogin = async (username, password) => {
  console.log("Attempting login with:", { username, password, config });
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      { name: username, email: password },
      config
    );
    return response.data;
  } catch (error) {
    console.log("Login error:", error);
  }
};

export const getAllTickets = async (filters = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}/tickets`, {
      ...config,
      params: {
        status: filters.status || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        clientId: filters.clientId || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      },
    });
    return response.data;
  } catch (error) {
    console.log("Get tickets error:", error);
  }
};

export const getTicketById = async (ticketId) => {
  try {
    const response = await axios.get(`${BASE_URL}/tickets/${ticketId}`, config);
    return response.data;
  } catch (error) {
    console.log("Get ticket by id error:", error);
  }
};

export const createTicket = async (ticketData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/tickets`,
      {
        title: ticketData.title,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority,
        status: ticketData.status || "open",
      },
      config
    );
    return response.data;
  } catch (error) {
    console.log("Create ticket error:", error);
  }
};

export const getDashboardSummary = async ({
  dateFrom,
  dateTo,
  clientId,
  status,
}) => {
  try {
    const response = await axios.get(`${BASE_URL}/dashboard/summary`, {
      ...config,
      params: {
        dateFrom,          
        dateTo,            
        clientId: clientId || undefined,  
        status: status || undefined,      
      },
    });
    return response.data;
  } catch (error) {
    console.log("Dashboard summary error:", error);
  }
};


export const getTicketsByClient = async ({ dateFrom, dateTo, status }) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dashboard/charts/tickets-by-client`,
      {
        ...config,
        params: {
          dateFrom,
          dateTo,
          status: status || undefined,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Tickets by client chart error:", error);
  }
};


export const getTicketsByModule = async ({ dateFrom, dateTo, clientId, status }) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dashboard/charts/tickets-by-module`,
      {
        ...config,
        params: {
          dateFrom,
          dateTo,
          clientId: clientId || undefined,
          status: status || undefined,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Tickets by module chart error:", error);
  }
};

export const getTicketActivity = async ({ dateFrom, dateTo, clientId, status }) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dashboard/charts/ticket-activity`,
      {
        ...config,
        params: {
          dateFrom,
          dateTo,
          clientId: clientId || undefined,
          status: status || undefined,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Ticket activity chart error:", error);
  }
};


export const getTicketsByCategory = async ({ dateFrom, dateTo, clientId, status }) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dashboard/charts/tickets-by-category`,
      {
        ...config,
        params: {
          dateFrom,
          dateTo,
          clientId: clientId || undefined,
          status: status || undefined,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Tickets by category chart error:", error);
  }
};

export const getCommunicationTickets = async (filters = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}/communication/tickets`, {
      ...config,
      params: {
        status: filters.status || undefined,
        clientId: filters.clientId || undefined,
      },
    });
    return response.data;
  } catch (error) {
    console.log("Get communication tickets error:", error);
  }
};

export const getTicketMessages = async (ticketId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/communication/tickets/${ticketId}/messages`,
      config
    );
    return response.data;
  } catch (error) {
    console.log("Get ticket messages error:", error);
  }
};

export const sendTicketMessage = async (ticketId, messageData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/communication/tickets/${ticketId}/messages`,
      {
        sender: messageData.sender,
        name: messageData.name,
        text: messageData.text,
      },
      config
    );
    return response.data;
  } catch (error) {
    console.log("Send message error:", error);
  }
};
