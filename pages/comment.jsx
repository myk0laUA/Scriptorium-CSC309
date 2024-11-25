import React, { useState } from 'react';
import { FaTrash, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const Comment = ({ comment, postId, handleAddComment, handleDeleteComment, handleVoteComment, depth = 0 }) => {
  const [reply, setReply] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReply = () => {
    handleAddComment(postId, comment.id, reply);
    setReply('');
    setShowReplyForm(false);
  };

  return (
    <div className={`bg-gray-100 p-2 sm:p-4 rounded-lg relative mb-2 ml-${depth * 2} sm:ml-${depth * 4} md:ml-${depth * 6} lg:ml-${depth * 8}`}>
      <div className="flex items-center mb-2">
        {comment.User?.avatar && (
          <img src={comment.User.avatar} alt="Avatar" className="w-8 h-8 rounded-full mr-2" />
        )}
        <span className="font-semibold text-gray-800">{comment.User?.firstName || 'You'}</span>
      </div>
      <button
        onClick={() => handleDeleteComment(comment.id, postId)}
        className="text-red-500 hover:text-red-600 absolute top-2 right-2"
      >
        <FaTrash size={15} />
      </button>
      <p className="text-gray-800">{comment.body}</p>
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
    </div>
  );
};

export default Comment;
