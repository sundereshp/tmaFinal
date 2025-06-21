// src/hooks/useInvitation.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useInvitation = () => {
    const navigate = useNavigate();

    const checkInvitation = async (isLoggedIn = false) => {
        const urlParams = new URLSearchParams(window.location.search);
        const inviteToken = urlParams.get('token');
        
        if (!inviteToken) return false;

        try {
            const response = await fetch(
                `https://vw.aisrv.in/new_backend/accept-invitation?token=${inviteToken}`, 
                {
                    credentials: 'include',
                    headers: isLoggedIn ? {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    } : {}
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                toast.success('Successfully joined the project!');
                
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
                if (data.projectId) {
                    navigate(`/projects/${data.projectId}`);
                    return true;
                }
            }
        } catch (error) {
            console.error('Error accepting invitation:', error);
            toast.error('Failed to process invitation');
        }
        return false;
    };

    return { checkInvitation };
};