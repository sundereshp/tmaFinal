import { FC } from 'react';

interface IconTabletProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconTablet: FC<IconTabletProps> = ({ className, fill = false, duotone = false }) => {
    // return (
    //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    //         <path opacity={duotone ? '0.5' : '1'} d="M12 4L10 4C6.22876 4 4.34315 4 3.17157 5.17157C2 6.34315 2 8.22876 2 12C2 15.7712 2 17.6569 3.17157 18.8284C4.11466 19.7715 5.52043 19.9554 8 19.9913M16 4.00869C18.4796 4.04456 19.8853 4.22849 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H12" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"/>
    //         <path opacity={duotone ? '0.5' : '1'} d="M15 17H9" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"/>
    //     </svg>
    // );
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path opacity={duotone ? '0.5' : '1'} d="M12 4L10 4C6.22876 4 4.34315 4 3.17157 5.17157C2 6.34315 2 8.22876 2 12C2 15.7712 2 17.6569 3.17157 18.8284C4.11466 19.7715 5.52043 19.9554 8 19.9913M16 4.00869C18.4796 4.04456 19.8853 4.22849 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H12" strokeWidth="1.5" strokeLinecap="round"/>
            <path opacity={duotone ? '0.5' : '1'} d="M15 17H9" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    );
};

export default IconTablet;
