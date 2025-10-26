import React from 'react';

const NotificationCard = ({ notification, onMarkAsRead, onAction }) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'friend_request':
                return '👋';
            case 'friend_request_accepted':
                return '✅';
            case 'friend_request_rejected':
                return '❌';
            case 'friendship_removed':
                return '👋';
            case 'user_blocked':
                return '🚫';
            default:
                return '🔔';
        }
    };

    const getActionText = () => {
        switch (notification.type) {
            case 'friend_request':
                return 'Ver solicitação';
            case 'friend_request_accepted':
                return 'Ver perfil';
            case 'friend_request_rejected':
                return 'Ver perfil';
            case 'friendship_removed':
                return 'Ver perfil';
            case 'user_blocked':
                return 'Ver perfil';
            default:
                return 'Ver detalhes';
        }
    };

    const handleClick = () => {
        if (!notification.read_at) {
            onMarkAsRead(notification.id);
        }
        onAction(notification);
    };

    return (
        <div
            className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.read_at ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
            onClick={handleClick}
        >
            <div className="flex items-start space-x-3">
                <div className="text-2xl">{getIcon()}</div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                    {!notification.read_at && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                        className="text-xs text-purple-600 hover:text-purple-800 transition-colors"
                    >
                        {getActionText()}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationCard;