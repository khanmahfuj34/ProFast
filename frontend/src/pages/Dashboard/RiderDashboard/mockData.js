// Mock API responses for Rider Dashboard
// This file provides sample data for development/demonstration

export const mockRiderDashboardStats = {
    assignedCount: 8,
    pendingPickups: 3,
    completedToday: 12,
    todayEarnings: 2450,
    weeklyEarnings: 18900,
    averageDeliveryTime: 28,
    successRate: 98.5
};

export const mockRiderDeliveries = [{
        id: 'TRK001',
        trackingId: 'TRK-1748923456',
        status: 'assigned',
        receiverName: 'Ahmed Hassan',
        pickupLocation: 'Dhaka City Center',
        deliveryLocation: 'Mirpur, Dhaka',
        amount: 1200,
        category: 'Electronics',
        weight: '2.5 kg'
    },
    {
        id: 'TRK002',
        trackingId: 'TRK-1748923457',
        status: 'picked_up',
        receiverName: 'Fatima Khan',
        pickupLocation: 'Gulshan, Dhaka',
        deliveryLocation: 'Banani, Dhaka',
        amount: 850,
        category: 'Clothing',
        weight: '1.2 kg'
    },
    {
        id: 'TRK003',
        trackingId: 'TRK-1748923458',
        status: 'on_the_way',
        receiverName: 'Mohammad Ali',
        pickupLocation: 'Ramna, Dhaka',
        deliveryLocation: 'Uttara, Dhaka',
        amount: 2100,
        category: 'Documents',
        weight: '0.5 kg'
    },
    {
        id: 'TRK004',
        trackingId: 'TRK-1748923459',
        status: 'delivered',
        receiverName: 'Sadia Akter',
        pickupLocation: 'Motijheel, Dhaka',
        deliveryLocation: 'Khilgaon, Dhaka',
        amount: 1450,
        category: 'Books',
        weight: '3.5 kg'
    },
    {
        id: 'TRK005',
        trackingId: 'TRK-1748923460',
        status: 'assigned',
        receiverName: 'Rajib Sharma',
        pickupLocation: 'Paltan, Dhaka',
        deliveryLocation: 'Kawran Bazar, Dhaka',
        amount: 950,
        category: 'Food Items',
        weight: '2.0 kg'
    }
];

export const mockRiderAnalytics = {
    deliveryTrend: [
        { day: 'Mon', deliveries: 12, earnings: 2400 },
        { day: 'Tue', deliveries: 15, earnings: 2800 },
        { day: 'Wed', deliveries: 10, earnings: 1800 },
        { day: 'Thu', deliveries: 18, earnings: 3200 },
        { day: 'Fri', deliveries: 20, earnings: 3800 },
        { day: 'Sat', deliveries: 16, earnings: 2900 },
        { day: 'Sun', deliveries: 14, earnings: 2600 }
    ],
    earningsByDay: [
        { day: 'Mon', earnings: 2400 },
        { day: 'Tue', earnings: 2800 },
        { day: 'Wed', earnings: 1800 },
        { day: 'Thu', earnings: 3200 },
        { day: 'Fri', earnings: 3800 },
        { day: 'Sat', earnings: 2900 },
        { day: 'Sun', earnings: 2600 }
    ],
    parcelStatus: [
        { name: 'Delivered', value: 145, fill: '#10B981' },
        { name: 'On Way', value: 32, fill: '#3B82F6' },
        { name: 'Pending', value: 18, fill: '#F59E0B' },
        { name: 'Cancelled', value: 5, fill: '#EF4444' }
    ]
};

export const mockRiderActivityFeed = [{
        id: 1,
        type: 'delivered',
        title: 'Delivery Completed',
        description: 'Successfully delivered parcel TRK-1748923451 to Mirpur',
        timestamp: new Date(Date.now() - 5 * 60000) // 5 mins ago
    },
    {
        id: 2,
        type: 'picked_up',
        title: 'Parcel Picked Up',
        description: 'Picked up parcel TRK-1748923457 from Gulshan center',
        timestamp: new Date(Date.now() - 15 * 60000) // 15 mins ago
    },
    {
        id: 3,
        type: 'delivered',
        title: 'Delivery Completed',
        description: 'Successfully delivered parcel TRK-1748923450 to Khilgaon',
        timestamp: new Date(Date.now() - 45 * 60000) // 45 mins ago
    },
    {
        id: 4,
        type: 'picked_up',
        title: 'Parcel Assigned',
        description: 'New parcel TRK-1748923456 assigned for delivery',
        timestamp: new Date(Date.now() - 2 * 3600000) // 2 hours ago
    },
    {
        id: 5,
        type: 'cancelled',
        title: 'Delivery Cancelled',
        description: 'Parcel TRK-1748923449 cancelled by customer',
        timestamp: new Date(Date.now() - 4 * 3600000) // 4 hours ago
    }
];

export const mockRiderPerformance = {
    successRate: 98.5,
    avgDeliveryTime: 28,
    customerRating: 4.8,
    completedToday: 12,
    totalCompleted: 2145,
    onTimeDeliveries: 98.2,
    customerSatisfaction: 97.5
};

export default {
    mockRiderDashboardStats,
    mockRiderDeliveries,
    mockRiderAnalytics,
    mockRiderActivityFeed,
    mockRiderPerformance
};