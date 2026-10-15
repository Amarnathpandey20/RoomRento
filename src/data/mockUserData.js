export const INITIAL_USER = {
  name: "Arjun Mehta",
  email: "arjun.mehta@techcorp.in",
  phone: "+91 98123 45678",
  city: "Bengaluru",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCApTZNNOMacD5jATVUbuAcRH2Tk0-vNG5BJ4Yx2S8Gmrp8nCr8t2c6J0rYBQJHQCI3jgPzfkf06FVWAjrjSlvgrFJu6shXidYRNDOQKSH0jrFfybJEiewhxzTeMvUud16IqS5S6tQ6FGWmUQJrSgSPxJRCy1MVn1AuU2Cs70Xrd1MG9SWxvH1UrwjsW250ZJ2TrIB-LgI1H0uq9aZX7z_E-_7rVkKf8sK2MoZVd7CI4VpnEkOOMUTM0A",
  savedCount: 3,
  compareCount: 2,
  visitsScheduled: 2,
  budgetPreference: "₹15,000 - ₹20,000",
  targetLocality: "Koramangala, Indiranagar"
};

export const INITIAL_ENQUIRIES = [
  {
    id: "enq-1",
    propertyId: "prop-101",
    propertyTitle: "Urban Luxe Private Studio",
    hostName: "Priya Sharma",
    hostAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    lastMessage: "Hi Arjun, yes, the room is available for immediate move-in! Would you like to schedule a visit today at 4 PM?",
    timestamp: "10:15 AM",
    unread: false,
    messages: [
      {
        id: "m-1",
        sender: "user",
        text: "Hi Priya! I saw the Urban Luxe Studio listing. Is it available for move-in from this weekend?",
        time: "10:05 AM"
      },
      {
        id: "m-2",
        sender: "host",
        text: "Hi Arjun, yes, the room is available for immediate move-in! Would you like to schedule a visit today at 4 PM?",
        time: "10:15 AM"
      }
    ]
  },
  {
    id: "enq-2",
    propertyId: "prop-102",
    propertyTitle: "Serene Heights Premium 2-Sharing",
    hostName: "Rajesh Kumar",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    lastMessage: "We have one cot available in the corner room facing the balcony.",
    timestamp: "Yesterday",
    unread: false,
    messages: [
      {
        id: "m-1",
        sender: "user",
        text: "Hello Rajesh, what are the food timings on weekdays?",
        time: "Yesterday"
      },
      {
        id: "m-2",
        sender: "host",
        text: "Breakfast 7:30 to 10:00 AM, Dinner 8:00 to 10:30 PM. We have one cot available in the corner room facing the balcony.",
        time: "Yesterday"
      }
    ]
  }
];

export const INITIAL_SCHEDULED_VISITS = [
  {
    id: "visit-1",
    propertyId: "prop-101",
    propertyTitle: "Urban Luxe Private Studio",
    locality: "4th Block, Koramangala",
    date: "Tomorrow, Oct 14",
    time: "4:00 PM - 5:00 PM",
    hostName: "Priya Sharma",
    hostPhone: "+91 98765 43210",
    status: "Confirmed"
  }
];
