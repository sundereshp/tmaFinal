import { FC } from 'react';

interface IconGraphNewUpProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconGraphNewUp: FC<IconGraphNewUpProps> = ({ className, fill = false, duotone = true }) => {
    // return (
    //     <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    //         <path d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"/>
    //         <circle opacity={duotone ? '0.5' : '1'} cx="19" cy="5" r="3" stroke="#1C274C" strokeWidth="1.5"/>
    //         <circle opacity={duotone ? '0.5' : '1'} cx="19" cy="5" r="3" stroke="#1C274C" strokeWidth="1.5"/>
    //         <path d="M7 14L9.29289 11.7071C9.68342 11.3166 10.3166 11.3166 10.7071 11.7071L12.2929 13.2929C12.6834 13.6834 13.3166 13.6834 13.7071 13.2929L17 10M17 10V12.5M17 10H14.5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    //     </svg>
    // );
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5" strokeWidth="1.5" strokeLinecap="round"/>
            <circle opacity={duotone ? '0.5' : '1'} cx="19" cy="5" r="3" strokeWidth="1.5"/>
            <circle opacity={duotone ? '0.5' : '1'} cx="19" cy="5" r="3" strokeWidth="1.5"/>
            <path d="M7 14L9.29289 11.7071C9.68342 11.3166 10.3166 11.3166 10.7071 11.7071L12.2929 13.2929C12.6834 13.6834 13.3166 13.6834 13.7071 13.2929L17 10M17 10V12.5M17 10H14.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
};

export default IconGraphNewUp;
