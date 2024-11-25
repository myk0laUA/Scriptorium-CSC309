import React, { useState, useEffect } from 'react';
import { FaTrash, FaThumbsUp, FaThumbsDown, FaFlag, FaEdit } from 'react-icons/fa';

/* Generated with ChatGPT */
const Comment = ({ comment, postId, handleAddComment, handleDeleteComment, handleVoteComment, depth = 0 }) => {
  const [reply, setReply] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [notification, setNotification] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.body);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const user = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(user.id);
    }
  }, []);

  const handleReply = () => {
    handleAddComment(postId, comment.id, reply);
    setReply('');
    setShowReplyForm(false);
  };

  const handleReportComment = async (commentId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setNotification('No authentication token found');
        setTimeout(() => setNotification(''), 3000);
        return;
      }

      const response = await fetch(`http://localhost:3000/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ contentId: commentId, contentType: 'comment' }),
      });

      if (response.status === 400) {
        setNotification('You have already reported this comment.');
        setTimeout(() => setNotification(''), 3000);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to report comment');
      }

      setNotification('Reported comment successfully');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setNotification(err.message);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setNotification('No authentication token found');
        setTimeout(() => setNotification(''), 3000);
        return;
      }

      const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ body: editedComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      const updatedComment = await response.json();
      setNotification('Comment updated successfully');
      setTimeout(() => setNotification(''), 3000);
      setIsEditing(false);
      comment.body = updatedComment.body; // Update the comment body in the local state
    } catch (err) {
      setNotification(err.message);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  return (
    <div className={`bg-gray-100 p-2 sm:p-4 rounded-lg relative mb-2 ml-${depth * 2} sm:ml-${depth * 4} md:ml-${depth * 6} lg:ml-${depth * 8}`}>
      <div className="flex items-center mb-2">
        {comment.User?.avatar && (
          <img src={comment.User.avatar} alt="Avatar" className="w-8 h-8 rounded-full mr-2" />
        )}
        <span className="font-semibold text-gray-800">{comment.User?.firstName || 'You'}</span>
      </div>
      <div className="flex items-center justify-between">
        {isEditing ? (
          <div className="flex-grow">
            <textarea
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-2 text-gray-800 bg-white"
              placeholder="Edit your comment"
            />
            <button
              onClick={() => handleEditComment(comment.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p className="text-gray-800 flex-grow">{comment.body}</p>
        )}
        <div className="flex items-center space-x-2">
          {currentUserId === comment.userId && (
            <>
              <button
                onClick={() => handleDeleteComment(comment.id, postId)}
                className="text-red-500 hover:text-red-600"
              >
                <FaTrash size={15} />
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-gray-500 hover:text-gray-600"
              >
                <FaEdit size={15} />
              </button>
            </>
          )}
          <button
            onClick={() => handleReportComment(comment.id)}
            className="text-gray-500 hover:text-gray-600"
          >
            <FaFlag size={15} />
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4 mt-2">
        <button
          onClick={() => handleVoteComment(comment.id, postId, 'upvote')}
          className="text-green-500 hover:text-green-600"
        >
          <FaThumbsUp size={20} />
        </button>
        <button
          onClick={() => handleVoteComment(comment.id, postId, 'downvote')}
          className="text-red-500 hover:text-red-600"
        >
          <FaThumbsDown size={20} />
        </button>
        <span className="text-gray-600">Rating: {comment.rating}</span>
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-blue-500 hover:underline"
        >
          Reply
        </button>
      </div>
      {showReplyForm && (
        <div className="mt-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2 text-gray-800 bg-white"
            placeholder="Add a reply"
          />
          <button
            onClick={handleReply}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Reply
          </button>
        </div>
      )}
      {comment.Replies && comment.Replies.length > 0 && (
        <div className="ml-4 mt-2">
          {comment.Replies.map((reply) => (
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
        <div className="bg-red-500 text-white p-2 rounded mt-2">
          {notification}
        </div>
      )}
    </div>
  );
};

export default Comment;