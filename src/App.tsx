import React, { useState, useEffect } from "react";

import axios from "axios";
import Header from "./components/Header";

interface NewsItem {
  id: number;
  title: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
}

export default function App() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    const response = await axios.get<number[]>(
      "https://hacker-news.firebaseio.com/v0/newstories.json"
    );
    const newsIds = response.data.slice(0, 100);

    const newsList = await Promise.all(
      newsIds.map(async (id) => {
        const newsResponse = await axios.get<NewsItem>(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        return newsResponse.data;
      })
    );

    newsList.sort((a, b) => b.time - a.time);
    setNewsList(newsList);
    console.log(newsList);
  };

  useEffect(() => {
    fetchNews();
  }, []);
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredNews = newsList.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <>
      <main className="relative min-h-screen bg-white sm:flex  ml-[30%]">
        <div className="relative sm:pb-16 sm:pt-8">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
              <div className=" rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800 sm:p-8">
                <Header />
                <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800 sm:p-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                      Latest Customers
                    </h5>
                    <button onClick={() => fetchNews()}>Обновить</button>
                  </div>
                  <div className="flow-root">
                    <input
                      type="text"
                      placeholder="Search news"
                      className="block w-full mt-2 mb-4 border p-3 border-indigo-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      onChange={handleSearch}
                    />
                    <ul
                      role="list"
                      className="divide-y divide-gray-200 dark:divide-gray-700"
                    >
                      {filteredNews.map((news) => (
                        <li className="py-3 sm:py-4" key={news.id}>
                          <div className="flex items-center space-x-4">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                <a href={`/news/${news.id}`}>
                                  <h3>{news.title.slice(0, 50)}...</h3>
                                </a>
                              </p>
                              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                <p>Автор: {news.by}</p>
                              </p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                Дату публикации:{" "}
                                {new Date(news.time * 1000).toLocaleString()}
                              </p>
                            </div>
                            <p>Comments: {news.descendants}</p>
                            <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                <p>Rating: {news.score}</p>
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
