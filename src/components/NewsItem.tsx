import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "./Header";
import axios from "axios";

interface Comment {
  id: number;
  by: string;
  text: string;
  kids?: Comment[];
  time: number;
  descendants: number;
}

interface NewsItem {
  id: number;
  title: string;
  by: string;
  time: number;
  score: number;
  url: string;
  descendants: number;
  kids?: number[];
}

function Comments({ comment }: { comment: Comment }) {
  const [showReplies, setShowReplies] = useState(false);

  function handleToggleReplies() {
    setShowReplies(!showReplies);
  }

  if (!comment) return null;

  return (
    <div style={{ marginLeft: "1rem" }}>
      <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
        <li className="py-3 sm:py-4" key={comment.id}>
          <div className="flex items-center space-x-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                <h3>{comment.by}:</h3>
              </p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                <p>Автор: {comment.by}</p>
              </p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate  text-gray-500 dark:text-gray-400">
                Дату публикации:{" "}
                {new Date(comment.time * 1000).toLocaleString()}
              </p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                <p>Автор: {comment.by}</p>
              </p>
            </div>
          </div>
        </li>
      </ul>

      {comment.kids && (
        <button onClick={handleToggleReplies}>
          {showReplies ? "Hide replies" : "Show replies"}
        </button>
      )}
      {showReplies &&
        comment.kids?.map((kid) => (
          <Comments key={kid.id} comment={kid as Comment} />
        ))}
    </div>
  );
}

function NewsItem() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      .then((response) => response.json())
      .then((data: NewsItem) => {
        setNews(data);
        console.log(data, "Data");
        setLoading(false);
      });
  }, [id]);
  const fetchComments = async () => {
    if (news?.kids) {
      const comments = await Promise.all(
        news.kids.map((kid) =>
          axios
            .get(`https://hacker-news.firebaseio.com/v0/item/${kid}.json`)
            .then((response) => response.data)
        )
      );
      comments.sort((a: Comment, b: Comment) => b.time - a.time);
      setComments(comments);
    }
  };
  useEffect(() => {
    if (news?.kids) {
      Promise.all(
        news.kids.map((kid) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${kid}.json`).then(
            (response) => response.json()
          )
        )
      ).then((data: Comment[]) => setComments(data));
    }
  }, [news]);
  console.log(news, "News");
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="relative min-h-screen bg-white sm:flex  sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className=" rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800 sm:p-8">
              <Header />

              <div className="mb-4 flex items-center justify-between">
                <div className="flow-root">
                  <div>
                    <Link to="/">
                      <button className="bg-blue-200 w-30 border border-gray-200 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                        Back to news list
                      </button>
                    </Link>
                  </div>
                  <ul
                    role="list"
                    className="divide-y divide-gray-200 dark:divide-gray-700"
                  >
                    <li>
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {news?.title}
                              </p>

                              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                <p>Автор: {news?.by}</p>
                              </p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white ">
                                <button
                                  onClick={fetchComments}
                                  className="bg-amber-300 w-20 border border-gray-200 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                                >
                                  Обновить
                                </button>
                              </p>

                              <p className="truncate text-sm text-gray-500 dark:text-gray-400"></p>
                            </div>
                          </div>

                          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                            <p> Количества комментариев: {news?.descendants}</p>
                          </p>
                          <div>
                            {comments.map((comment) => (
                              <Comments key={comment.id} comment={comment} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default NewsItem;
