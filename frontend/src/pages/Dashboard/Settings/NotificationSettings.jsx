import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
    RiNotification3Line, 
    RiTruckLine, 
    RiMoneyDollarCircleLine, 
    RiMegaphoneLine, 
    RiPercentLine, 
    RiMailSendLine, 
    RiChat3Line,
    RiInformationLine
} from 'react-icons/ri';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const NotificationSettings = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    // Fetch Settings
    const { data: settings, isLoading } = useQuery({
        queryKey: ['notificationSettings'],
        queryFn: async () => {
            const response = await axiosSecure.get('/notification-settings');
            return response.data.settings;
        }
    });

    // Update Mutation
    const mutation = useMutation({
        mutationFn: async (updateData) => {
            const response = await axiosSecure.patch('/notification-settings', updateData);
            return response.data;
        },
        onMutate: async (newSetting) => {
            await queryClient.cancelQueries({ queryKey: ['notificationSettings'] });
            const previousSettings = queryClient.getQueryData(['notificationSettings']);
            queryClient.setQueryData(['notificationSettings'], (old) => ({ ...old, ...newSetting }));
            return { previousSettings };
        },
        onError: (err, newSetting, context) => {
            queryClient.setQueryData(['notificationSettings'], context.previousSettings);
            toast.error('Failed to update preference');
        },
        onSuccess: () => {
            toast.success('Preference updated');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
        }
    });

    const handleToggle = (field, value) => {
        mutation.mutate({ [field]: value });
    };

    if (isLoading) {
        return (
            <div className="p-10 flex flex-col items-center justify-center space-y-4">
                <span className="loading loading-spinner loading-lg text-lime-500"></span>
                <p className="text-slate-500 font-medium animate-pulse">Loading preferences...</p>
            </div>
        );
    }

    const settingsGroups = [
        {
            title: "Activity Notifications",
            description: "Control how you receive updates about your parcels and payments.",
            items: [
                {
                    id: 'parcelUpdate',
                    label: 'Parcel Updates',
                    sublabel: 'Get notified when your parcel status changes (e.g. Delivered, Returned).',
                    icon: <RiTruckLine className="text-blue-500" size={20} />,
                    value: settings?.parcelUpdate
                },
                {
                    id: 'payment',
                    label: 'Payment & Billing',
                    sublabel: 'Receive alerts for successful payments and pending invoices.',
                    icon: <RiMoneyDollarCircleLine className="text-emerald-500" size={20} />,
                    value: settings?.payment
                }
            ]
        },
        {
            title: "System & Marketing",
            description: "Stay informed about platform updates and special offers.",
            items: [
                {
                    id: 'announcement',
                    label: 'Admin Announcements',
                    sublabel: 'Important news about platform updates, downtime, and policy changes.',
                    icon: <RiMegaphoneLine className="text-amber-500" size={20} />,
                    value: settings?.announcement
                },
                {
                    id: 'promotion',
                    label: 'Promotional Offers',
                    sublabel: 'Occasional discounts, new feature announcements, and newsletters.',
                    icon: <RiPercentLine className="text-purple-500" size={20} />,
                    value: settings?.promotion
                }
            ]
        },
        {
            title: "Channel Preferences",
            description: "Choose which communication channels we can use to reach you.",
            items: [
                {
                    id: 'emailNotifications',
                    label: 'Email Notifications',
                    sublabel: 'Receive detailed updates and reports directly in your inbox.',
                    icon: <RiMailSendLine className="text-red-400" size={20} />,
                    value: settings?.emailNotifications
                },
                {
                    id: 'smsNotifications',
                    label: 'SMS Notifications',
                    sublabel: 'Quick alerts via text message. (Carrier rates may apply)',
                    icon: <RiChat3Line className="text-indigo-400" size={20} />,
                    value: settings?.smsNotifications
                }
            ]
        }
    ];

    return (
        <div className="p-6 md:p-10">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-8 mb-8">
                <div className="w-12 h-12 bg-lime-100 rounded-2xl flex items-center justify-center text-lime-600">
                    <RiNotification3Line size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Notification Settings</h2>
                    <p className="text-slate-500 text-sm">Choose how and when you want to be notified.</p>
                </div>
            </div>

            <div className="space-y-12">
                {settingsGroups.map((group, gIdx) => (
                    <section key={gIdx} className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{group.title}</h3>
                            <p className="text-slate-500 text-sm">{group.description}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {group.items.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-lime-200 hover:bg-white transition-all duration-300 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{item.label}</p>
                                            <p className="text-xs text-slate-500 max-w-sm mt-0.5 leading-relaxed">{item.sublabel}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            className="toggle toggle-lg border-slate-300 bg-slate-300 checked:bg-lime-500 checked:border-lime-500 [--tglbg:white]" 
                                            checked={!!item.value} 
                                            onChange={(e) => handleToggle(item.id, e.target.checked)}
                                            disabled={mutation.isPending}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <div className="mt-12 p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500">
                    <RiInformationLine size={20} />
                </div>
                <p className="text-sm text-amber-800 leading-relaxed">
                    <strong>Note:</strong> Critical security alerts and account-related updates will always be sent regardless of your notification preferences to ensure the safety of your account.
                </p>
            </div>
        </div>
    );
};

export default NotificationSettings;
