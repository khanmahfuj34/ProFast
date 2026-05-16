import { useNotifications } from '../contexts/NotificationContext';

const useRiderStatus = () => {
    const { isOnline, toggleStatus, statusLoading: isLoading } = useNotifications();
    return { isOnline, toggleStatus, isLoading };
};

export default useRiderStatus;
