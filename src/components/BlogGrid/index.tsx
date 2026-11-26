"use client";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import BlogItem from "../Blog/BlogItem";
import { supabase } from "@/lib/supabase";
import PreLoader from "../Common/PreLoader";
import BlogSkeleton from "../Common/BlogSkeleton";

const BlogGridContent = () => {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag") || "Semua";
  const [selectedTag, setSelectedTag] = useState(initialTag);
  
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    const tagFromUrl = searchParams.get("tag");
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    }
  }, [searchParams]);
  const [tags, setTags] = useState(["Semua"]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('blogs')
        .select('category');
      
      if (data) {
        const uniqueCategories = Array.from(new Set(data.map(b => b.category).filter(Boolean)));
        // Urutkan kategori sesuai urutan standar, sisanya di akhir
        const order = ["Seragam SD", "Seragam SMP", "Seragam SMA", "Seragam Pramuka", "Seragam Batik", "Seragam Olahraga", "Aksesori"];
        uniqueCategories.sort((a, b) => {
          const indexA = order.indexOf(a);
          const indexB = order.indexOf(b);
          if (indexA === -1 && indexB === -1) return a.localeCompare(b);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        setTags(["Semua", ...uniqueCategories]);
      }
    };
    fetchCategories();
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - 200 : scrollLeft + 200;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchBlogsSafe = async () => {
      setLoading(true);
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from('blogs')
        .select('*', { count: 'exact' });

      if (selectedTag !== "Semua") {
        const tagKey = selectedTag.split(" ").pop();
        query = query.or(`category.eq."${selectedTag}",title.ilike.%${tagKey}%`);
      }

      const { data, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (isMounted) {
        if (data) setBlogs(data);
        if (count !== null) setTotalItems(count);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    fetchBlogsSafe();
    return () => { isMounted = false; };
  }, [currentPage, selectedTag]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const renderPagination = () => {
    // ... (logic tetap sama)
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages.map((page, index) => (
      <li key={index}>
        {page === "..." ? (
          <span className="flex py-1.5 px-3.5 duration-200 rounded-[3px] text-dark-4">
            ...
          </span>
        ) : (
          <button
            onClick={() => setCurrentPage(page as number)}
            className={`flex py-1.5 px-3.5 duration-200 rounded-[3px] ${
              currentPage === page
                ? "bg-blue text-white"
                : "hover:text-white hover:bg-blue text-dark-4"
            }`}
          >
            {page}
          </button>
        )}
      </li>
    ));
  };

  return (
    <>
      <Breadcrumb title={"Blog"} pages={["blog"]} />{" "}
      <section className="overflow-hidden mt-0 pt-[10px] pb-10 lg:py-20 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          
          {/* Tag Populer UI with Arrows */}
          <div className="flex items-center gap-4 mb-10 relative group">
            <span className="text-dark-4 whitespace-nowrap font-medium">Tag Populer :</span>
            
            <div className="relative flex-1 min-w-0 flex items-center gap-2">
              <button 
                onClick={() => scroll("left")}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-3 text-dark hover:bg-blue hover:text-white hover:border-blue transition-all shadow-sm z-10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>

              <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .no-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                  -webkit-overflow-scrolling: touch;
                }
              `}</style>
              <div 
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 touch-pan-x"
              >
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      setCurrentPage(1);
                    }}
                    className={`px-6 py-2 rounded-md border text-sm font-medium transition-all whitespace-nowrap ${
                      selectedTag === tag
                        ? "bg-blue/10 border-blue text-blue shadow-sm"
                        : "bg-white border-gray-3 text-dark hover:border-blue hover:text-blue"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => scroll("right")}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-3 text-dark hover:bg-blue hover:text-white hover:border-blue transition-all shadow-sm z-10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-7.5">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i}>
                  <BlogSkeleton />
                </div>
              ))
            ) : blogs.length > 0 ? (
              blogs.map((blog, key) => (
                <BlogItem blog={blog} key={key} priority={key === 0} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-xl">
                <p className="text-dark-5 italic">Artikel sedang disiapkan...</p>
              </div>
            )}
          </div>

          {/* <!-- Blog Pagination Start --> */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-15">
              <div className="bg-white shadow-1 rounded-md p-2">
                <ul className="flex items-center">
                  <li>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4 disabled:hover:bg-transparent disabled:hover:text-gray-4"
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.1782 16.1156C12.0095 16.1156 11.8407 16.0594 11.7282 15.9187L5.37197 9.45C5.11885 9.19687 5.11885 8.80312 5.37197 8.55L11.7282 2.08125C11.9813 1.82812 12.3751 1.82812 12.6282 2.08125C12.8813 2.33437 12.8813 2.72812 12.6282 2.98125L6.72197 9L12.6563 15.0187C12.9095 15.2719 12.9095 15.6656 12.6563 15.9187C12.4876 16.0312 12.347 16.1156 12.1782 16.1156Z"
                          fill=""
                        />
                      </svg>
                    </button>
                  </li>

                  {renderPagination()}

                  <li>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4 disabled:hover:bg-transparent disabled:hover:text-gray-4"
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.82197 16.1156C5.65322 16.1156 5.5126 16.0594 5.37197 15.9469C5.11885 15.6937 5.11885 15.3 5.37197 15.0469L11.2782 9L5.37197 2.98125C5.11885 2.72812 5.11885 2.33437 5.37197 2.08125C5.6251 1.82812 6.01885 1.82812 6.27197 2.08125L12.6282 8.55C12.8813 8.80312 12.8813 9.19687 12.6282 9.45L6.27197 15.9187C6.15947 16.0312 5.99072 16.1156 5.82197 16.1156Z"
                          fill=""
                        />
                      </svg>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
          {/* <!-- Blog Pagination End --> */}
        </div>
      </section>
    </>
  );
};

const BlogGrid = () => {
  return (
    <Suspense fallback={<PreLoader />}>
      <BlogGridContent />
    </Suspense>
  );
};

export default BlogGrid;
