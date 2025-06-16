export const LoadingIcon = ({ className }) => {
    return (
        <span className={`animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ${className} inline-block align-middle`}></span>
    );
};

export const DownLoadIcon = ({ className = "w-4 h-4 ltr:mr-1 rtl:ml-1" }) => {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5l5-5m-5-7v12"></path></svg>
    );
};

export const ViewIcon = ({ className = "" }) => {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
                <path d="M8.25 12a3.75 3.75 0 1 1 7.5 0a3.75 3.75 0 0 1-7.5 0ZM12 9.75a2.25 2.25 0 1 0 0 4.5a2.25 2.25 0 0 0 0-4.5Z"></path>
                <path d="M4.323 10.646c-.419.604-.573 1.077-.573 1.354c0 .277.154.75.573 1.354c.406.583 1.008 1.216 1.77 1.801C7.62 16.327 9.713 17.25 12 17.25s4.38-.923 5.907-2.095c.762-.585 1.364-1.218 1.77-1.801c.419-.604.573-1.077.573-1.354c0-.277-.154-.75-.573-1.354c-.406-.583-1.008-1.216-1.77-1.801C16.38 7.673 14.287 6.75 12 6.75s-4.38.923-5.907 2.095c-.762.585-1.364 1.218-1.77 1.801Zm.856-2.991C6.91 6.327 9.316 5.25 12 5.25s5.09 1.077 6.82 2.405c.867.665 1.583 1.407 2.089 2.136c.492.709.841 1.486.841 2.209c0 .723-.35 1.5-.841 2.209c-.506.729-1.222 1.47-2.088 2.136c-1.73 1.328-4.137 2.405-6.821 2.405s-5.09-1.077-6.82-2.405c-.867-.665-1.583-1.407-2.089-2.136C2.6 13.5 2.25 12.723 2.25 12c0-.723.35-1.5.841-2.209c.506-.729 1.222-1.47 2.088-2.136Z"></path>
            </g>
        </svg>
    );
};

export const RightArrowIcon = ({ className = "" }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" ></path>
        </svg>
    )
}
