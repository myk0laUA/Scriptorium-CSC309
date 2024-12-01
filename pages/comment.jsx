import React, { useState, useEffect } from 'react';
import { FaTrash, FaThumbsUp, FaThumbsDown, FaFlag, FaEdit } from 'react-icons/fa';

const Comment = ({
  comment,
  postId,
  handleAddComment,
  handleDeleteComment,
  handleVoteComment,
  depth = 0,
}) => {
  const [reply, setReply] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [notification, setNotification] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment?.body || '');
  const [localComment, setLocalComment] = useState(comment);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const user = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(user.id);
      }
    }
  }, []);

  // Sync localComment with comment prop
  useEffect(() => {
    setLocalComment(comment);
  }, [comment]);

  const handleReply = async () => {
    try {
      await handleAddComment(postId, localComment.id, reply);
      setReply('');
      setShowReplyForm(false);
    } catch (err) {
      setNotification('Failed to add reply. Please try again.');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleVote = async (voteType) => {
    const alreadyUpvoted = localComment.upvotedByUsers?.some(
      (user) => user.id === currentUserId
    );
    const alreadyDownvoted = localComment.downvotedByUsers?.some(
      (user) => user.id === currentUserId
    );

    let newUpvotedByUsers = [...(localComment.upvotedByUsers || [])];
    let newDownvotedByUsers = [...(localComment.downvotedByUsers || [])];

    // Optimistically update the state
    if (voteType === 'upvote') {
      if (alreadyUpvoted) {
        newUpvotedByUsers = newUpvotedByUsers.filter(
          (user) => user.id !== currentUserId
        );
      } else {
        newUpvotedByUsers.push({ id: currentUserId });
        newDownvotedByUsers = newDownvotedByUsers.filter(
          (user) => user.id !== currentUserId
        );
      }
    } else if (voteType === 'downvote') {
      if (alreadyDownvoted) {
        newDownvotedByUsers = newDownvotedByUsers.filter(
          (user) => user.id !== currentUserId
        );
      } else {
        newDownvotedByUsers.push({ id: currentUserId });
        newUpvotedByUsers = newUpvotedByUsers.filter(
          (user) => user.id !== currentUserId
        );
      }
    }

    setLocalComment((prev) => ({
      ...prev,
      upvotedByUsers: newUpvotedByUsers,
      downvotedByUsers: newDownvotedByUsers,
      rating: newUpvotedByUsers.length - newDownvotedByUsers.length,
    }));

    try {
      await handleVoteComment(localComment.id, postId, voteType);
    } catch (err) {
      setNotification('Failed to update vote. Please try again.');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  return (
    <div
      className={`bg-gray-100 dark:bg-gray-800 p-2 sm:p-4 rounded-lg relative mb-2 ml-${
        depth * 2
      } sm:ml-${depth * 4} md:ml-${depth * 6} lg:ml-${depth * 8}`}
    >
      <div className="flex items-center mb-2">
        {localComment?.User?.avatar && (
          <img
            src={localComment.User.avatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full mr-2"
          />
        )}
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {localComment?.User?.firstName || 'You'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        {isEditing ? (
          <div className="flex-grow">
            <textarea
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900"
              placeholder="Edit your comment"
            />
            <button
              onClick={() => handleEditComment(localComment?.id)}
              className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-800"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 dark:bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-800 ml-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p className="text-gray-800 dark:text-gray-200 flex-grow">
            {localComment?.body || 'No content available'}
          </p>
        )}
        <div className="flex items-center space-x-2">
          {currentUserId &&
            localComment?.userId &&
            currentUserId === localComment.userId && (
              <>
                <button
                  onClick={() =>
                    localComment?.id &&
                    handleDeleteComment(localComment.id, postId)
                  }
                  className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500"
                >
                  <FaTrash size={15} />
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaEdit size={15} />
                </button>
              </>
            )}
          <button
            onClick={() => handleReportComment(localComment?.id)}
            className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"
          >
            <FaFlag size={15} />
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4 mt-2">
        <button
          onClick={() => handleVote('upvote')}
          className={`${
            localComment.upvotedByUsers?.some(
              (user) => user.id === currentUserId
            )
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          } hover:text-green-600 dark:hover:text-green-500`}
        >
          <FaThumbsUp size={20} />
        </button>
        <button
          onClick={() => handleVote('downvote')}
          className={`${
            localComment.downvotedByUsers?.some(
              (user) => user.id === currentUserId
            )
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          } hover:text-red-600 dark:hover:text-red-500`}
        >
          <FaThumbsDown size={20} />
        </button>
        <span className="text-gray-600 dark:text-gray-400">
          Rating: {localComment?.rating || 0}
        </span>
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-blue-500 dark:text-blue-400 hover:underline"
        >
          Reply
        </button>
      </div>
      {showReplyForm && (
        <div className="mt-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900"
            placeholder="Add a reply"
          />
          <button
            onClick={handleReply}
            className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-800"
          >
            Add Reply
          </button>
        </div>
      )}
      {localComment?.Replies && localComment.Replies.length > 0 && (
        <div className="ml-4 mt-2">
          {localComment.Replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              handleAddComment={handleAddComment}
              handleDeleteComment={handleDeleteComment}
              handleVoteComment={handleVoteComment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
      {notification && (
        <div className="bg-red-500 dark:bg-red-700 text-white p-2 rounded mt-2">
          {notification}
        </div>
      )}
    </div>
  );
};

export default Comment;
