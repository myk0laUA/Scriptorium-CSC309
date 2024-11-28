import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../app/globals.css';
import { FaTrash, FaThumbsUp, FaThumbsDown, FaFlag } from 'react-icons/fa';
import Comment from './comment';

{/* Generated by ChatGPT */}  
const BlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [filterTemplateMention, setFilterTemplateMention] = useState('');
  const [filterTags, setFilterTags] = useState('');
  const [sortOption, setSortOption] = useState('oldest');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notification, setNotification] = useState('');
  const [userId, setUserId] = useState(null);
  


  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token); 
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      setUserId(decodedToken.id);
      console.log('userId:', decodedToken.id, typeof decodedToken.id);
    }
  }, []);  

  const fetchBlogPosts = async (title = '', description = '', tags = '', sort = 'oldest', templateMention, page = 1, limit = 10) => {
    try {
      let response;
      if (templateMention) {
        response = await fetch(`http://localhost:3000/api/blogPost?title=${title}&description=${description}&tags=${tags}&sort=${sort}&templateMention=${templateMention}&page=${page}&limit=${limit}`);
      } else {
        response = await fetch(`http://localhost:3000/api/blogPost?title=${title}&description=${description}&tags=${tags}&sort=${sort}&page=${page}&limit=${limit}`);
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const data = await response.json();

      const visiblePosts = data.data.filter((post) => !post.hidden);

      setBlogPosts(visiblePosts); 
      setCurrentPage(data.page);
      setLimit(data.limit);
      setTotalPages(Math.ceil(data.totalCount / limit));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  useEffect(() => {
    blogPosts.forEach((post) => {
      fetchComments(post.id);
    });
  }, [blogPosts]);

  const fetchComments = async (postId, sort = 'recent') => {
    try {
      const response = await fetch(`http://localhost:3000/api/comments?postId=${postId}&sort=${sort}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: data.comments,
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddComment = async (postId, parentCommentId = null, body) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }
  
      const response = await fetch(`http://localhost:3000/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, body, parentCommentId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
  
      const comment = await response.json();
      setComments((prevComments) => {
        const updatedComments = { ...prevComments };
        if (parentCommentId) {
          const addReplyToParent = (comments) => {
            return comments.map((c) => {
              if (c.id === parentCommentId) {
                return {
                  ...c,
                  Replies: [...(c.Replies || []), comment],
                };
              } else if (c.Replies) {
                return {
                  ...c,
                  Replies: addReplyToParent(c.Replies),
                };
              }
              return c;
            });
          };
          updatedComments[postId] = addReplyToParent(updatedComments[postId]);
        } else {
          updatedComments[postId] = [...(updatedComments[postId] || []), comment];
        }
        return updatedComments;
      });
      setNewComment('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm("Are you sure you want to delete this comment and its replies, if any?")) {
      return;
    }
  
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }
  
      const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        setNotification("Failed to delete the comment, please try again later");
        setTimeout(() => setNotification(''), 3000);
        return;
      }
  
      const removeCommentAndChildren = (comments, commentId) => {
        return comments.filter((comment) => {
          if (comment.id === commentId) {
            return false;
          }
          if (comment.Replies) {
            comment.Replies = removeCommentAndChildren(comment.Replies, commentId);
          }
          return true;
        });
      };
  
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: removeCommentAndChildren(prevComments[postId], commentId),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVoteComment = async (commentId, postId, vote) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }
  
      const response = await fetch(`http://localhost:3000/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ vote }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to vote on comment');
      }
  
      const updatedComment = await response.json();
      setComments((prevComments) => {
        const updateCommentInTree = (comments) => {
          return comments.map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                rating: updatedComment.rating, // Update only the rating
              };
            } else if (c.Replies) {
              return {
                ...c,
                Replies: updateCommentInTree(c.Replies),
              };
            }
            return c;
          });
        };
        return {
          ...prevComments,
          [postId]: updateCommentInTree(prevComments[postId]),
        };
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReportContent = async (contentId, contentType) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ contentId, contentType }),
      });

      if (response.status === 400) {
        setNotification("You have already reported this " + contentType);
        setTimeout(() => setNotification(''), 3000);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to report ' + contentType);
      }

      setNotification("Reported " + contentType + " successfully");
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      fetchBlogPosts(filterTitle, filterDescription, filterTags, sortOption, filterTemplateMention, nextPage, limit);
      setCurrentPage(nextPage);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      fetchBlogPosts(filterTitle, filterDescription, filterTags, sortOption, filterTemplateMention, prevPage, limit);
      setCurrentPage(prevPage);
    }
  };

  const handleFilterSubmit = () => {
    fetchBlogPosts(filterTitle, filterDescription, filterTags, sortOption, filterTemplateMention); 
    setShowFilterModal(false);
  };

  const openFilterModal = () => {
    setShowFilterModal(true);
  };

  const closeFilterModal = () => {
    setShowFilterModal(false);
  };  

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/blogPost/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove the deleted blog post from the state
        setBlogPosts(blogPosts.filter(post => post.id !== id));
      } else {
        throw new Error('Failed to delete the blog post');
      }
    } catch (err) {
      setError(err.message);
    }
  }; 

  const handleVote = async (id, vote) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/blogPost/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ vote }),
      });
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to vote');
      }

      const updatedPost = await response.json();

      setBlogPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id
            ? {
                ...post,
                rating: updatedPost.rating,
                upvotedByUsers: updatedPost.upvotedByUsers,
                downvotedByUsers: updatedPost.downvotedByUsers,
              }
            : post
        )
      );

    } catch (err) {
      setError(err.message);
    }
  };

  const handleSortChange = (e) => {
    const selectedSort = e.target.value;
    setSortOption(selectedSort);
    fetchBlogPosts(filterTitle, filterDescription, filterTags, selectedSort, filterTemplateMention);
  };

  const handleCommentSortChange = (postId, sort) => {
    fetchComments(postId, sort);
  };

  if (loading) return <div>Loading blog posts...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Blog Posts</h2>

      {notification && (
        <div className="bg-red-500 text-white p-4 rounded mb-4">
          {notification}
        </div>
      )}

      <div className="flex justify-start mb-6 space-x-4">
        <Link href="/create-post">
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg text-xl hover:bg-green-600">
            Create Blog Post
          </button>
        </Link>

        <button 
          onClick={openFilterModal}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg text-xl hover:bg-gray-600"
        >  
          Filter
        </button>

        {showFilterModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg relative">
            <h2 className="text-2xl font-semibold mb-4">Filter Blog Posts</h2>
            <input
              type="text"
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Enter title to filter"
            />
            <input
              type="text"
              value={filterDescription}
              onChange={(e) => setFilterDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Enter description to filter"
            />
            <input
              type="text"
              value={filterTags}
              onChange={(e) => setFilterTags(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Enter tags to filter"
            />
            <input
              type="text"
              value={filterTemplateMention}
              onChange={(e) => setFilterTemplateMention(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Search for a particular Template mentioned"
            />

            <div className="flex justify-between">
              <button
                onClick={handleFilterSubmit}
                className="bg-green-500 text-white px-6 py-3 rounded-lg text-xl hover:bg-green-600"
              >
                Apply Filter
              </button>
              <button
                onClick={closeFilterModal}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg text-xl hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <label htmlFor="sortOptions" className="text-gray-700 text-xl font-medium">
          Sort By:
      </label>

      <select
        id="sortOptions"
        value={sortOption}
        onChange={handleSortChange}
        className="bg-white text-gray-800 px-6 py-3 rounded-lg text-xl border border-gray-300"
      >
        <option value="oldest">Date Added (Oldest)</option>
        <option value="valued">Valued</option>
        <option value="controversial">Controversial</option>
      </select>
    </div>
      
      <div className="space-y-6">
        {blogPosts.map((post) => (
          <div key={post.id} className="bg-white p-6 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 relative">
            <button
              onClick={() => handleDelete(post.id)}
              className={`absolute top-4 right-4 ${
                post.author.id === userId
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-500 cursor-default'
              }`}
            >
              <FaTrash size={15} />
            </button>

            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
              <div className="flex items-center space-x-2">
                <img
                  src={post.author.avatar}
                  alt={`${post.author.username}'s avatar`}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-500">Author: {post.author.username}</span>
              </div>
            </div>

            <div className="flex items-center text-yellow-500 mb-4">
              <strong>Rating:</strong>
              <span className="ml-2">{post.rating}</span>
            </div>

            <p className="text-gray-700 mb-2">{post.description}</p>

            <div className="text-sm text-gray-500 mb-4">
              <strong>Tags:</strong> {post.tags}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleVote(post.id, 'upvote')}
                className={`${
                  post.upvotedByUsers.some((user) => user.id === userId) ? 'text-blue-500' : 'text-gray-500'
                } hover:text-blue-600`}
              >
                <FaThumbsUp size={20} />
              </button>
              <button
                onClick={() => handleVote(post.id, 'downvote')}
                className={`${
                  post.downvotedByUsers.some((user) => user.id === userId) ? 'text-blue-500' : 'text-gray-500'
                } hover:text-blue-600`}
              >
                <FaThumbsDown size={20} />
              </button>
              <button
                onClick={() => handleReportContent(post.id, 'post')}
                className="text-gray-500 hover:text-gray-600"
              >
                <FaFlag size={20} />
              </button>
            </div>

            <Link href={`/edit-post/${post.id}`}>
              <button 
                className={`mt-4 px-4 py-2 rounded w-full ${
                  post.author.id === userId
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-500 text-white cursor-default'
                }`}
              >
                Edit
              </button>
            </Link>

            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">Comments</h4>
              <label htmlFor={`commentSortOptions-${post.id}`} className="text-gray-700 text-xl font-medium">
                Sort By:
              </label>
              <select
                id={`commentSortOptions-${post.id}`}
                onChange={(e) => handleCommentSortChange(post.id, e.target.value)}
                className="bg-white text-gray-800 px-6 py-3 rounded-lg text-xl border border-gray-300 mb-4"
              >
                <option value="recent">Recent</option>
                <option value="top">Top</option>
                <option value="controversial">Controversial</option>
              </select>
              <div className="space-y-4">
                {comments[post.id]?.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    handleAddComment={handleAddComment}
                    handleDeleteComment={handleDeleteComment}
                    handleVoteComment={handleVoteComment}
                  />
                ))}
              </div>
              <div className="mt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                  placeholder="Add a comment"
                />
                <button
                  onClick={() => handleAddComment(post.id, null, newComment)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Previous
        </button>
        
        <label htmlFor="limitOptions" className="text-gray-700 text-xl font-medium">
          Posts per page:
        </label>
        <select
          id="limitOptions"
          value={limit}
          onChange={(e) => {
            const selectedLimit = parseInt(e.target.value);
            setLimit(selectedLimit);
            fetchBlogPosts(filterTitle, filterDescription, filterTags, sortOption, filterTemplateMention, 1, selectedLimit);
          }}
          className="bg-white text-gray-800 px-6 py-3 rounded-lg text-xl border border-gray-300"
        >
          <option value="1">1</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>

        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Next
        </button>
      </div>

      <Link href={isLoggedIn ? "/loggedin" : "/"}>
        <button
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
        >
        Back
        </button>
      </Link>

      </div>
    );
  };
  
  export default BlogPosts;