import React from 'react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-6">
        {/* Số 404 lớn với hiệu ứng gradient */}
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#B50FBF] to-[#F89B2B]">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Oops! Trang không tồn tại.
          </h2>
          <p className="text-base text-gray-500 max-w-lg mx-auto">
            Có vẻ như trang bạn đang tìm kiếm đã bị di chuyển hoặc không còn tồn tại.
            Hãy thử quay lại trang chủ nhé.
          </p>
        </div>

        {/* Nút điều hướng */}
        <div className="mt-8">
          <a
            href="/"
            className="group inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 shadow-lg shadow-blue-500/30 
            hover:bg-blue-700 hover:shadow-blue-500/50 hover:-translate-y-0.5
            active:bg-blue-800 active:scale-95 active:shadow-none active:translate-y-0
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            transition-all duration-150 ease-in-out"
          >
            <svg 
              className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}