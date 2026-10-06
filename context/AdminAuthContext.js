'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminAuthContext = createContext(null);

export const PRESET_USERS = [
  {
    key: 'owner',
    name: 'Vikramaditya Singhania',
    email: 'owner@livinn.com',
    role: 'OWNER_ADMIN',
    department: null,
    hotelName: 'Jayaasi Rooms (Pune)',
    hotelSlug: 'jayaasi-rooms',
    avatar: 'VS',
    badge: '👑 Owner Admin',
  },
  {
    key: 'housekeeping',
    name: 'Sunita Patil',
    email: 'sunita.housekeeping@jayaasi.com',
    role: 'STAFF_ADMIN',
    department: 'HOUSEKEEPING',
    hotelName: 'Jayaasi Rooms (Pune)',
    hotelSlug: 'jayaasi-rooms',
    avatar: 'SP',
    badge: '🧹 Staff · Housekeeping',
  },
  {
    key: 'kitchen',
    name: 'Chef Rajesh Marathe',
    email: 'chef.kitchen@jayaasi.com',
    role: 'STAFF_ADMIN',
    department: 'KITCHEN',
    hotelName: 'Jayaasi Rooms (Pune)',
    hotelSlug: 'jayaasi-rooms',
    avatar: 'RM',
    badge: '👨‍🍳 Staff · Kitchen',
  },
  {
    key: 'maintenance',
    name: 'Vikram Shinde',
    email: 'vikram.maintenance@jayaasi.com',
    role: 'STAFF_ADMIN',
    department: 'MAINTENANCE',
    hotelName: 'Jayaasi Rooms (Pune)',
    hotelSlug: 'jayaasi-rooms',
    avatar: 'VS',
    badge: '🔧 Staff · Maintenance',
  },
  {
    key: 'hotel_b_owner',
    name: 'Goa Owner Admin',
    email: 'owner@emeraldbay.com',
    role: 'OWNER_ADMIN',
    department: null,
    hotelName: 'Emerald Bay Resort (Goa)',
    hotelSlug: 'emerald-bay',
    avatar: 'GB',
    badge: '🏖️ Hotel B Owner',
  },
];

export function AdminAuthProvider({ children }) {
  const [selectedUserKey, setSelectedUserKey] = useState('owner');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('OWNER_ADMIN');
  const [department, setDepartment] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginAs = useCallback(async (userKey) => {
    setLoading(true);
    const target = PRESET_USERS.find((u) => u.key === userKey) || PRESET_USERS[0];
    const password = target.role === 'OWNER_ADMIN' ? 'OwnerPass123!' : 'StaffPass123!';

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target.email, password, hotelCode: target.hotelSlug }),
      });
      const data = await res.json();

      if (data.success) {
        setSelectedUserKey(userKey);
        setUser(data.user);
        setRole(data.role);
        setDepartment(data.department);
        setHotel(data.hotel);
        setPermissions(data.permissions || []);
        setToken(data.token);
      }
    } catch (err) {
      console.error('[AdminAuthProvider] Login failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loginAs('owner');
  }, [loginAs]);

  const hasPermission = useCallback(
    (permKey) => {
      return permissions.includes(permKey);
    },
    [permissions]
  );

  const apiFetch = useCallback(
    async (url, options = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (hotel?.id) {
        headers['x-hotel-id'] = hotel.id;
      }

      return fetch(url, { ...options, headers });
    },
    [token, hotel]
  );

  const isOwner = role === 'OWNER_ADMIN';
  const isStaff = role === 'STAFF_ADMIN';

  return (
    <AdminAuthContext.Provider
      value={{
        selectedUserKey,
        user,
        role,
        department,
        hotel,
        permissions,
        token,
        loading,
        isOwner,
        isStaff,
        hasPermission,
        loginAs,
        apiFetch,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
