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
                <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading preferences...</p>
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
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in duration-500 transition-colors duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-4">
                <div className="w-12 h-12 bg-lime-100 dark:bg-lime-950/20 rounded-2xl flex items-center justify-center text-lime-600 dark:text-lime-400 shadow-sm border border-lime-100 dark:border-lime-900/30">
                    <RiNotification3Line size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Notification Settings</h2>
                    <p className="text-slate-500 dark:text-slate-350 text-sm mt-1">Choose how and when you want to be notified.</p>
                </div>
            </div>

            <div className="p-8 space-y-12">
                {settingsGroups.map((group, gIdx) => (
                    <section key={gIdx} className="space-y-6">
                        <div className="px-1">
                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest">{group.title}</h3>
                            <p className="text-slate-500 dark:text-slate-455 text-xs mt-1 leading-relaxed">{group.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {group.items.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-700/60 hover:border-lime-200 dark:hover:border-lime-500/30 hover:bg-lime-50/20 dark:hover:bg-lime-950/10 transition-all duration-300 group shadow-sm"
                                
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:scale-110 transition-all duration-300">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{item.label}</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[200px] mt-1 leading-relaxed">{item.sublabel}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            className="toggle toggle-md border-slate-300 dark:border-slate-600 bg-slate-300 dark:bg-slate-600 checked:bg-lime-500 checked:border-lime-500 [--tglbg:white] dark:[--tglbg:slate-800]" 
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

            <div className="m-8 mt-0 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[24px] border border-slate-100 dark:border-slate-700 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-amber-500 shrink-0">
                    <RiInformationLine size={20} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-medium">
                    <strong className="text-slate-900 dark:text-white">Important:</strong> Critical security alerts and account-related updates will always be sent regardless of your notification preferences to ensure the safety of your account.
                </p>
            </div>
        </div>
    );
};

export default NotificationSettings;
