// Mock data for Admin Dashboard fallback - used when API endpoints are unavailable
// This allows the dashboard to display properly while backend is being developed

export const mockAdminStats = {
    totalParcels: 1250,
    pendingParcels: 145,
    deliveredParcels: 987,
    cancelledParcels: 118,
    totalRevenue: 125000,
    activeRiders: 42,
    onlineRiders: 28
};

export const mockAdminPayments = [{
        _id: '1',
        trackingId: 'TRK001',
        senderName: 'John Doe',
        receiverName: 'Jane Smith',
        amount: 500,
        totalPrice: 525,
        paymentStatus: 'paid',
        status: 'completed',
        paidAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        transactionId: 'TXN001'
    },
    {
        _id: '2',
        trackingId: 'TRK002',
        senderName: 'Ahmed Khan',
        receiverName: 'Sara Ali',
        amount: 750,
        totalPrice: 825,
        paymentStatus: 'paid',
        status: 'completed',
        paidAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        transactionId: 'TXN002'
    },
    {
        _id: '3',
        trackingId: 'TRK003',
        senderName: 'Business Store',
        receiverName: 'Customer XYZ',
        amount: 1200,
        totalPrice: 1350,
        paymentStatus: 'pending',
        status: 'processing',
        paidAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        transactionId: 'TXN003'
    }
];

export const mockAdminParcels = [{
        _id: '1',
        trackingId: 'PKG001',
        senderName: 'John Doe',
        receiverName: 'Jane Smith',
        status: 'delivered',
        category: 'Electronics',
        weight: 1.5,
        deliveryFee: 100,
        totalPrice: 525,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: '2',
        trackingId: 'PKG002',
        senderName: 'Business Corp',
        receiverName: 'Office Ltd',
        status: 'on_the_way',
        category: 'Documents',
        weight: 0.5,
        deliveryFee: 75,
        totalPrice: 325,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: '3',
        trackingId: 'PKG003',
        senderName: 'Shop Online',
        receiverName: 'Customer ABC',
        status: 'pending',
        category: 'Clothing',
        weight: 2.0,
        deliveryFee: 150,
        totalPrice: 825,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
];

export const mockAdminRiders = [{
        _id: '1',
        name: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        phone: '01700000001',
        status: 'Approved',
        workStatus: 'available',
        district: 'Dhaka',
        totalDeliveries: 250,
        rating: 4.8,
        onlineStatus: true
    },
    {
        _id: '2',
        name: 'Fatima Khan',
        email: 'fatima@example.com',
        phone: '01700000002',
        status: 'Approved',
        workStatus: 'available',
        district: 'Dhaka',
        totalDeliveries: 180,
        rating: 4.6,
        onlineStatus: true
    },
    {
        _id: '3',
        name: 'Karim Ali',
        email: 'karim@example.com',
        phone: '01700000003',
        status: 'Approved',
        workStatus: 'available',
        district: 'Chittagong',
        totalDeliveries: 320,
        rating: 4.9,
        onlineStatus: false
    }
];

export const mockAdminAnalytics = {
    deliveryTrend: [
        { date: 'Mon', deliveries: 95, revenue: 12500 },
        { date: 'Tue', deliveries: 110, revenue: 14300 },
        { date: 'Wed', deliveries: 87, revenue: 11200 },
        { date: 'Thu', deliveries: 125, revenue: 16800 },
        { date: 'Fri', deliveries: 140, revenue: 18500 },
        { date: 'Sat', deliveries: 155, revenue: 20100 },
        { date: 'Sun', deliveries: 120, revenue: 15600 }
    ],
    parcelStatus: [
        { name: 'Delivered', value: 987, fill: '#10B981' },
        { name: 'On Way', value: 145, fill: '#3B82F6' },
        { name: 'Pending', value: 98, fill: '#F59E0B' },
        { name: 'Cancelled', value: 20, fill: '#EF4444' }
    ],
    revenueByDay: [
        { day: 'Mon', revenue: 12500 },
        { day: 'Tue', revenue: 14300 },
        { day: 'Wed', revenue: 11200 },
        { day: 'Thu', revenue: 16800 },
        { day: 'Fri', revenue: 18500 },
        { day: 'Sat', revenue: 20100 },
        { day: 'Sun', revenue: 15600 }
    ]
};

export const mockAdminActivityFeed = [{
        id: '1',
        type: 'delivery_completed',
        title: 'Delivery Completed',
        description: 'Package PKG-001 delivered to Jane Smith',
        timestamp: Date.now() - 5 * 60 * 1000
    },
    {
        id: '2',
        type: 'rider_online',
        title: 'Rider Online',
        description: 'Ahmed Hassan (Rider #5) is now online',
        timestamp: Date.now() - 15 * 60 * 1000
    },
    {
        id: '3',
        type: 'payment_received',
        title: 'Payment Received',
        description: 'Payment of ৳1,250 received for PKG-003',
        timestamp: Date.now() - 30 * 60 * 1000
    },
    {
        id: '4',
        type: 'new_rider_application',
        title: 'New Rider Application',
        description: 'Karim Ali submitted rider application',
        timestamp: Date.now() - 2 * 60 * 60 * 1000
    },
    {
        id: '5',
        type: 'delivery_failed',
        title: 'Delivery Failed',
        description: 'Delivery attempt failed for PKG-025 - Will retry',
        timestamp: Date.now() - 3 * 60 * 60 * 1000
    }
];