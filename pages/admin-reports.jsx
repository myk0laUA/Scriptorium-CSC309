import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

/* Generated with ChatGPT */
const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState('post');
  const [sortByReports, setSortByReports] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/admin/reports?contentType=${contentType}&sortByReports=${sortByReports}&page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [contentType, sortByReports, page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const toggleVisibility = async (contentId, currentVisibility) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/admin/reports/hide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ contentId, contentType, hidden: !currentVisibility }),
      });

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      fetchReports();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="container mx-auto p-4 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Reports</h1>
        {error && <p className="text-red-500">{error}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <div className="mb-4 sm:mb-0">
                  <label className="mr-2 text-gray-700">Content Type:</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg border border-gray-300"
                  >
                    <option value="post">Post</option>
                    <option value="comment">Comment</option>
                  </select>
                </div>
                <div>
                  <label className="mr-2 text-gray-700">Sort By Reports:</label>
                  <input
                    type="checkbox"
                    checked={sortByReports}
                    onChange={(e) => setSortByReports(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                      <th className="py-2 px-4 text-left">ID</th>
                      <th className="py-2 px-4 text-left">Content</th>
                      <th className="py-2 px-4 text-left">Reports</th>
                      <th className="py-2 px-4 text-left">Visibility</th>
                      <th className="py-2 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm font-light">
                    {reports.map((report) => (
                      <tr key={report.id} className={`border-b border-gray-200 hover:bg-gray-50 ${report.hidden ? 'line-through text-red-500' : ''}`}>
                        <td className="py-2 px-4 text-left">{report.id}</td>
                        <td className="py-2 px-4 text-left">{report.body || report.title}</td>
                        <td className="py-2 px-4 text-left">{report.numReports}</td>
                        <td className="py-2 px-4 text-left">{report.hidden ? 'Hidden' : 'Visible'}</td>
                        <td className="py-2 px-4 text-left">
                          <button
                            onClick={() => toggleVisibility(report.id, report.hidden)}
                            className={`px-4 py-2 rounded ${report.hidden ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                          >
                            {report.hidden ? 'Unhide' : 'Hide'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded ${page === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded ${page === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;