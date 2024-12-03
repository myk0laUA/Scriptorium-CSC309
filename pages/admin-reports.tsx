import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import '../app/globals.css';

// used ChatGPT for conversion to tsx
interface Report {
  id: number;
  body?: string;
  title?: string;
  numReports: number;
  hidden: boolean;
}

// Logic influenced by ChatGPT
const AdminReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
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

  const toggleVisibility = async (contentId: number, currentVisibility: boolean) => {
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentId, contentType, hidden: !currentVisibility }),
      });

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      fetchReports();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
        <div className="container mx-auto p-4 flex-grow">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Admin Reports</h1>
          {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          ) : (
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                  <div className="mb-4 sm:mb-0">
                    <label className="mr-2 text-gray-700 dark:text-gray-300">Content Type:</label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                    >
                      <option value="post">Post</option>
                      <option value="comment">Comment</option>
                    </select>
                  </div>
                  <div>
                    <label className="mr-2 text-gray-700 dark:text-gray-300">Sort By Reports:</label>
                    <input
                      type="checkbox"
                      checked={sortByReports}
                      onChange={(e) => setSortByReports(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
                        <th className="py-2 px-4 text-left">ID</th>
                        <th className="py-2 px-4 text-left">Content</th>
                        <th className="py-2 px-4 text-left">Reports</th>
                        <th className="py-2 px-4 text-left">Visibility</th>
                        <th className="py-2 px-4 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700 dark:text-gray-300 text-sm font-light">
                      {reports.map((report) => (
                        <tr
                          key={report.id}
                          className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            report.hidden ? 'line-through text-red-500 dark:text-red-400' : ''
                          }`}
                        >
                          <td className="py-2 px-4 text-left">{report.id}</td>
                          <td className="py-2 px-4 text-left">{report.body || report.title}</td>
                          <td className="py-2 px-4 text-left">{report.numReports}</td>
                          <td className="py-2 px-4 text-left">{report.hidden ? 'Hidden' : 'Visible'}</td>
                          <td className="py-2 px-4 text-left">
                            <button
                              onClick={() => toggleVisibility(report.id, report.hidden)}
                              className={`px-4 py-2 rounded ${
                                report.hidden
                                  ? 'bg-green-500 dark:bg-green-700 text-white hover:bg-green-600 dark:hover:bg-green-800'
                                  : 'bg-red-500 dark:bg-red-700 text-white hover:bg-red-600 dark:hover:bg-red-800'
                              }`}
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
                  className={`px-4 py-2 rounded ${
                    page === 1
                      ? 'bg-gray-300 dark:bg-gray-700'
                      : 'bg-blue-500 dark:bg-blue-700 text-white hover:bg-blue-600 dark:hover:bg-blue-800'
                  }`}
                >
                  Previous
                </button>
                <span className="text-gray-700 dark:text-gray-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded ${
                    page === totalPages
                      ? 'bg-gray-300 dark:bg-gray-700'
                      : 'bg-blue-500 dark:bg-blue-700 text-white hover:bg-blue-600 dark:hover:bg-blue-800'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminReports;