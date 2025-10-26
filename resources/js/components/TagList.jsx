import React from 'react';

const TagList = ({ 
    tags = [], 
    onTagClick = null, 
    showCount = false, 
    showType = false,
    className = "",
    tagClassName = ""
}) => {
    if (!tags || tags.length === 0) {
        return null;
    }

    const getTagColor = (tag) => {
        const colors = {
            'post': 'bg-blue-100 text-blue-800 border-blue-200',
            'campaign': 'bg-green-100 text-green-800 border-green-200',
            'general': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[tag.type] || colors.general;
    };

    const getTagIcon = (tag) => {
        const icons = {
            'post': '📝',
            'campaign': '🎲',
            'general': '🏷️'
        };
        return icons[tag.type] || icons.general;
    };

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {tags.map(tag => (
                <span
                    key={tag.id}
                    onClick={() => onTagClick && onTagClick(tag)}
                    className={`
                        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
                        ${getTagColor(tag)}
                        ${onTagClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
                        ${tagClassName}
                    `}
                >
                    {showType && (
                        <span className="mr-1" role="img" aria-label={tag.type}>
                            {getTagIcon(tag)}
                        </span>
                    )}
                    <span>{tag.name}</span>
                    {showCount && tag.usage_count !== undefined && (
                        <span className="ml-1 text-xs opacity-75">
                            ({tag.usage_count})
                        </span>
                    )}
                </span>
            ))}
        </div>
    );
};

export default TagList;
