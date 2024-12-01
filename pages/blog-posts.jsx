import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../app/globals.css';
import { FaTrash, FaThumbsUp, FaThumbsDown, FaFlag } from 'react-icons/fa';
import Comment from './comment';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

{/* Generated with ChatGPT */}  
const BlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [filterTags, setFilterTags] = useState('');
  const [filterTemplateMention, setFilterTemplateMention] = useState('');
  const [filterLinkToTemplates, setFilterLinkToTemplates] = useState('');
  const [sortOption, setSortOption] = useState('oldest');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notification, setNotification] = useState('');
  const [userId, setUserId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token); 
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      setUserId(decodedToken.id);
      console.log('userId:', decodedToken.id, typeof decodedToken.id);
    }
  }, []);  

  useEffect(() => {
    if (showFilterModal) {
      const fetchTemplates = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/templates/public?limit=100');
          if (!response.ok) {
            throw new Error('Failed to fetch templates');
          }
          const data = await response.json();
          setTemplates(data.templates);
        } catch (err) {
          setError(err.message);
        }
      };

      fetchTemplates();
    }
  }, [showFilterModal]);

  const fetchBlogPosts = async (title = '', description = '', tags = '', sort = 'oldest', templateMention, linkToTemplates = '', page = 1, limit = 10) => {
    try {
      let response;
      if (templateMention) {
        response = await fetch(`http://localhost:3000/api/blogPost?title=${title}&description=${description}&tags=${tags}&sort=${sort}&templateMention=${templateMention}&linkToTemplates=${linkToTemplates}&page=${page}&limit=${limit}`);
      } else {
        response = await fetch(`http://localhost:3000/api/blogPost?title=${title}&description=${description}&tags=${tags}&sort=${sort}&linkToTemplates=${linkToTemplates}&page=${page}&limit=${limit}`);
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const data = await response.json();

      const visiblePosts = data.data.filter((post) => !post.hidden);

      console.log("Fetched blog posts:", visiblePosts);

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
      fetchBlogPosts(filterTitle, filterDescription, filterTags, sortOption, filterTemplateMention, filterLinkToTemplates, nextPage, limit);
      setCurrentPage(nextPage);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      fetchBlogPosts(filterTitle, filterDescription, filterTags, sortOption, filterTemplateMention, filterLinkToTemplates, prevPage, limit);
      setCurrentPage(prevPage);
    }
  };

  const handleFilterSubmit = () => {
    fetchBlogPosts(filterTitle, filterDescription, filterTags, sortOption, filterTemplateMention, filterLinkToTemplates); 
    setShowFilterModal(false);
  };

  const handleTemplateChange = (e) => {
    setFilterTemplateMention(e.target.value);
  };

  const handleLinkToTemplatesChange = (e) => {
    const { options } = e.target;
    const selectedTemplateIds = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedTemplateIds.push(Number(options[i].value));
      }
    }
    setFilterLinkToTemplates(selectedTemplateIds.join(','));
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

    // Function to handle viewing the attached template
    const handleViewTemplate = async (templateId) => {
      try {
        const token = localStorage.getItem('accessToken'); // generated by ChatGPT
        if (!token) {
          setError('You are not logged in');
          return;
        }
    
        // Fetch all templates (since public API doesn't provide single-template fetching)
        const response = await fetch(`/api/templates/public`, {
          headers: {
            'Authorization': `Bearer ${token}`, // generated by ChatGPT
          },
        });
    
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
    
        // Filter the desired template by its ID
        const data = await response.json();
        const template = data.templates.find((t) => t.id === templateId);
    
        if (!template) {
          throw new Error('Template not found');
        }
    
        localStorage.setItem('selectedTemplate', JSON.stringify(template));
        router.push('/editor');
      } catch (err) {
        setError(err.message);
      }
    };

  return (
    <Layout>
    <div className="p-6">
    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Blog Posts</h2>

    {notification && (
      <div className="bg-red-500 text-white p-4 rounded mb-4">{notification}</div>
    )}

    <div className="flex flex-col sm:flex-row justify-start mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
      {isLoggedIn && (
        <Link href="/create-post">
          <button
            className="bg-green-500 text-white px-6 py-3 rounded-lg text-xl hover:bg-green-600 w-full sm:w-auto whitespace-nowrap flex items-center justify-center"
          >
            Create Blog Post
          </button>
        </Link>
      )}

      <button
        onClick={openFilterModal}
        className="bg-gray-500 text-white px-6 py-3 rounded-lg text-xl hover:bg-gray-600 w-full sm:w-auto whitespace-nowrap flex items-center justify-center"
      >
        Filter
      </button>

      {showFilterModal && (
      <div className="fixed top-0 left-0 w-full h-full bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg relative">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Filter Blog Posts
          </h2>
          <input
            type="text"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            placeholder="Enter title to filter"
          />
          <input
            type="text"
            value={filterDescription}
            onChange={(e) => setFilterDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            placeholder="Enter description to filter"
          />
          <input
            type="text"
            value={filterTags}
            onChange={(e) => setFilterTags(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            placeholder="Enter tags to filter"
          />
          
          <div className="mb-4">
              <label className="block text-gray-400 text-m font-medium mb-2">Filter by templates linked (press Ctrl for multi-selection)</label>
              <select
                multiple
                value={filterLinkToTemplates}
                onChange={handleLinkToTemplatesChange}
                className="w-full p-2 mt-2 border border-gray-300 rounded"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}> 
                    {template.title}
                  </option>
                ))}
              </select>
            </div>

          <div className="mb-4">
            <label className="block text-gray-400 text-m font-medium mb-2">Filter by template mentioned</label>
            <select
              value={filterTemplateMention}
              onChange={handleTemplateChange}
              className="w-full p-2 mt-2 border border-gray-300 rounded"
            >
              <option value="">No Filter</option>
              {templates.map((template) => (
                <option key={template.id} value={template.title}> 
                  {template.title}
                </option>
              ))}
            </select>
          </div>

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

<div className="w-full text-right space-x-2">
      <label
        htmlFor="sortOptions"
        className="text-gray-700 dark:text-gray-300 text-xl font-medium"
      >
        Sort By:
      </label>
      <select
        id="sortOptions"
        value={sortOption}
        onChange={handleSortChange}
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg text-xl border border-gray-300 dark:border-gray-600"
      >
        <option value="oldest">Date Added (Oldest)</option>
        <option value="valued">Valued</option>
        <option value="controversial">Controversial</option>
      </select>
    </div>
  </div>
      
      <div className="space-y-6">
        {blogPosts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 relative">
            {post.author.id === userId && (
              <button
              onClick={() => handleDelete(post.id)}
              className="absolute top-4 right-4 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500"
            >
              <FaTrash size={15} />
            </button>
          )}

          <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                {post.title}
              </h3>
              <div className="flex items-center space-x-2">
                <img
                  src={post.author.avatar}
                  alt={`${post.author.username}'s avatar`}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Author: {post.author.username}
                </span>
              </div>
            </div>

            <div className="flex items-center text-yellow-500 mb-4">
              <strong>Rating:</strong>
              <span className="ml-2">{post.rating}</span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-2">{post.description}</p>

            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <strong>Tags:</strong> {post.tags}
            </div>

            {/* Generated by ChatGPT */}  
            {post.linkToTemplates && post.linkToTemplates.length > 0 && (
              <div className="text-sm text-gray-500 mb-4">
                <strong>Linked Templates:</strong>
                <span>
                  {post.linkToTemplates.map((link, index) => (
                    <span key={link.templateId}>
                      <span
                        onClick={() => handleViewTemplate(link.templateId)}
                        className="text-blue-500 cursor-pointer hover:text-blue-600"
                      >
                        {link.template.title}
                        </span>

                        {index < post.linkToTemplates.length - 1 && ', '}
                    </span>
                  ))}
                </span>
              </div>
            )}
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleVote(post.id, 'upvote')}
                  className={`${
                    post.upvotedByUsers.some((user) => user.id === userId)
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  } hover:text-green-600 dark:hover:text-green-500`}
                >
                  <FaThumbsUp size={20} />
                </button>
                <button
                  onClick={() => handleVote(post.id, 'downvote')}
                  className={`${
                    post.downvotedByUsers.some((user) => user.id === userId)
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  } hover:text-red-600 dark:hover:text-red-500`}
                >
                  <FaThumbsDown size={20} />
                </button>
                <button
                  onClick={() => handleReportContent(post.id, 'post')}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"
                >
                  <FaFlag size={20} />
                </button>
              </div>

              {post.author.id === userId && (
                <Link href={`/edit-post/${post.id}`}>
                  <button className="mt-4 px-4 py-2 rounded bg-blue-500 dark:bg-blue-700 text-white hover:bg-blue-600 dark:hover:bg-blue-800">
                    Edit
                  </button>
                </Link>
              )}

            {post.templateId && (
              <div className="mt-4">
                <button
                  onClick={() => handleViewTemplate(post.templateId)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  View Attached Template
                </button>
              </div>
            )}

            <hr className="my-6 border-gray-300 dark:border-gray-700" />

            <div className="mt-6">
          <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Comments
          </h4>
          <label
            htmlFor={`commentSortOptions-${post.id}`}
            className="text-gray-700 dark:text-gray-300 text-xl font-medium"
          >
            Sort By:
          </label>
          <select
            id={`commentSortOptions-${post.id}`}
            onChange={(e) => handleCommentSortChange(post.id, e.target.value)}
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg text-xl border border-gray-300 dark:border-gray-600 mb-4"
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
              className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded mb-2"
              placeholder="Add a comment"
            />
            <button
              onClick={() => handleAddComment(post.id, null, newComment)}
              className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-800"
            >
              Add Comment
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
                

<div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0">
    <button
      onClick={handlePreviousPage}
      disabled={currentPage === 1}
      className={`px-4 py-2 rounded ${
        currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      Previous
    </button>

    <div className="flex items-center space-x-2">
      <label
        htmlFor="limitOptions"
        className="text-gray-700 dark:text-gray-300 text-xl font-medium"
      >
        Posts per page:
      </label>
      <select
        id="limitOptions"
        value={limit}
        onChange={(e) => {
          const selectedLimit = parseInt(e.target.value);
          setLimit(selectedLimit);
          fetchBlogPosts(
            filterTitle,
            filterDescription,
            filterTags,
            sortOption,
            filterTemplateMention,
            1,
            selectedLimit
          );
        }}
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg text-xl border border-gray-300 dark:border-gray-600"
      >
        <option value="1">1</option>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
      </select>
    </div>

    <span className="text-gray-700 dark:text-gray-300">
      Page {currentPage} of {totalPages}
    </span>
      <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded ${
          currentPage === totalPages
            ? 'bg-gray-300'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        Next
      </button>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPosts;