# Contract
## 1 API Contracts for Event Management

## Overview
This document describes how Members and Admins can interact with events in the BhangraEscape system. It covers two main features:
1. Marking interest in performing at an event (Yes/No)
2. Setting availability for practice days (selecting weekdays)

### User Types and Permissions
- **Members/Admins**: Can mark interest and set availability for future events
- **Guests**: Can only view event details and cannot make changes

## Data Structures

### Event Object
```json
{
  "id": "evt_123",                 // Unique event identifier
  "title": "Diwali Night",         // Name of the event
  "location": "Community Hall",     // Where the event takes place
  "date": "2025-10-18T19:00:00Z",  // When the event happens
  
  "performers": [                   // List of people interested in performing
    {
      "userId": "u1",
      "name": "Aisha",
      "avatarUrl": "/avatars/u1.jpg",
      "description": "Lead dancer with 5 years of experience"
    }
  ],

  "tallies": {                     // Count of people available each day
    "MON": 0, "TUE": 0, "WED": 0, 
    "THU": 0, "FRI": 0, "SAT": 0, "SUN": 1
  },

  "topDays": [                     // Days with most people available
    { "weekday": "SUN", "count": 1 }
  ],

  "capabilities": {                 // What the current user can do
    "canSetInterest": true,
    "canSetAvailability": true
  },

  "interested": false,             // If current user wants to perform
  "myDays": ["SUN","MON"]         // Current user's available days
}
```

## API Endpoints

### 1. Get Event Details
```http
GET /api/events/:eventId
```
Returns all information about an event, including performers and availability.

**Possible Errors**:
- 404: Event not found

### 2. Mark Interest in Performing
```http
POST /api/events/:eventId/interest
```
Tell the system if you want to perform at this event.

**Request Body**:
```json
{ "interested": true }
```

**Response**:
```json
{ 
  "interested": true, 
  "performerCount": 5 
}
```

**Possible Errors**:
- 401: Not logged in
- 403: Not allowed (guests or past events)
- 404: Event not found

### 3. Get Availability Information
```http
GET /api/events/:eventId/availability
```
See which days people are available and your selected days.

**Response**:
```json
{
  "eventId": "evt_123",
  "myDays": ["SUN","MON"],
  "tallies": { 
    "MON": 1, "TUE": 0, "WED": 0,
    "THU": 0, "FRI": 0, "SAT": 0, "SUN": 1 
  },
  "topDays": [
    { "weekday": "SUN", "count": 1 },
    { "weekday": "MON", "count": 1 }
  ],
  "capabilities": { 
    "canSetAvailability": true 
  }
}
```

### 4. Update Your Availability
```http
POST /api/events/:eventId/availability
```
Set which days you're available for practice.

**Request Body**:
```json
{ "days": ["SUN", "MON"] }
```

**Response**:
```json
{
  "myDays": ["SUN","MON"],
  "tallies": { 
    "MON": 1, "TUE": 0, "WED": 0,
    "THU": 0, "FRI": 0, "SAT": 0, "SUN": 1 
  },
  "topDays": [
    { "weekday": "SUN", "count": 1 },
    { "weekday": "MON", "count": 1 }
  ]
}
```

**Possible Errors**:
- 400: Invalid days selected
- 401: Not logged in
- 403: Not allowed to update
- 404: Event not found

## Important Notes
- Guests can only view information, not make changes
- Changes only work for future events
- Days are represented as: "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"
- When no one has set availability yet, all day counts start at zero
- The system always shows the top 2 most