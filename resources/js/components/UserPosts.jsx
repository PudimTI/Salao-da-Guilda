import React from 'react';
import FeedPost from './FeedPost';

const UserPosts = ({ posts, onLike, onRepost, onComment }) => {
    return (
        <div className="space-y-6">
            {posts.map((p) => (
                <FeedPost 
                    key={p.id} 
                    post={p} 
                    onLike={onLike}
                    onRepost={onRepost}
                    onComment={onComment}
                />
            ))}
        </div>
    );
};

export default UserPosts;




