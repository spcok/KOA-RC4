import { useState, useEffect, useMemo } from 'react';
import { AnimalCategory, DailyRound } from '../../types';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { mutateOnlineFirst } from '../../lib/syncEngine';

interface AnimalCheckState {
    isAlive?: boolean;
    isWatered: boolean;
    isSecure: boolean;
    securityIssue?: string;
    healthIssue?: string;
}

export function useDailyRoundData(viewDate: string) {
    const liveAnimals = useLiveQuery(() => db.animals.toArray(), []);
    const allAnimals = useMemo(() => liveAnimals || [], [liveAnimals]);

    const [isLoading, setIsLoading] = useState(true);
    const [roundType, setRoundType] = useState<'Morning' | 'Evening'>('Morning');
    const [activeTab, setActiveTab] = useState<AnimalCategory>(AnimalCategory.OWLS);
    
    const [checks, setChecks] = useState<Record<string, AnimalCheckState>>({});
    const [signingInitials, setSigningInitials] = useState('');
    const [generalNotes, setGeneralNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (liveAnimals !== undefined) {
            const timer = setTimeout(() => setIsLoading(false), 0);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => setIsLoading(false), 500);
            return () => clearTimeout(timer);
        }
    }, [liveAnimals]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setChecks({});
            setSigningInitials('');
            setGeneralNotes('');
        }, 0);
        return () => clearTimeout(timer);
    }, [viewDate, roundType, activeTab]);

    const categoryAnimals = useMemo(() => {
        return allAnimals.filter(a => a.category === activeTab);
    }, [allAnimals, activeTab]);

    const toggleHealth = (id: string, issue?: string) => {
        setChecks(prev => {
            const current = prev[id] || { isWatered: false, isSecure: false };
            if (current.isAlive === true) {
                return { ...prev, [id]: { ...current, isAlive: false, healthIssue: issue } };
            } else if (current.isAlive === false) {
                return { ...prev, [id]: { ...current, isAlive: true, healthIssue: undefined } };
            } else {
                return { ...prev, [id]: { ...current, isAlive: true } };
            }
        });
    };

    const toggleWater = (id: string) => {
        setChecks(prev => {
            const current = prev[id] || { isWatered: false, isSecure: false };
            return { ...prev, [id]: { ...current, isWatered: !current.isWatered } };
        });
    };

    const toggleSecure = (id: string, issue?: string) => {
        setChecks(prev => {
            const current = prev[id] || { isWatered: false, isSecure: false };
            if (current.isSecure) {
                return { ...prev, [id]: { ...current, isSecure: false, securityIssue: issue } };
            } else if (current.securityIssue) {
                return { ...prev, [id]: { ...current, isSecure: true, securityIssue: undefined } };
            } else {
                return { ...prev, [id]: { ...current, isSecure: true } };
            }
        });
    };

    const completedChecks = useMemo(() => {
        return categoryAnimals.filter(animal => {
            const state = checks[animal.id];
            if (!state) return false;
            
            const isDone = (activeTab === AnimalCategory.OWLS || activeTab === AnimalCategory.RAPTORS) 
                ? (state.isAlive !== undefined && (state.isSecure || Boolean(state.securityIssue)))
                : (state.isAlive !== undefined && state.isWatered && (state.isSecure || Boolean(state.securityIssue)));
            
            return isDone;
        }).length;
    }, [categoryAnimals, checks, activeTab]);

    const totalAnimals = categoryAnimals.length;
    const progress = totalAnimals === 0 ? 0 : Math.round((completedChecks / totalAnimals) * 100);
    const isComplete = totalAnimals > 0 && completedChecks === totalAnimals;
    
    const isNoteRequired = useMemo(() => {
        if (activeTab === AnimalCategory.OWLS || activeTab === AnimalCategory.RAPTORS) return false;
        return false;
    }, [activeTab]);

    const isPastRound = false;

    const handleSignOff = async () => {
        if (!isComplete || !signingInitials) return;
        
        setIsSubmitting(true);
        try {
            const round: DailyRound = {
                id: uuidv4(),
                date: viewDate,
                shift: roundType,
                status: 'Completed',
                completedBy: signingInitials,
                notes: generalNotes
            };
            
            await mutateOnlineFirst('daily_rounds', round, 'upsert');
            
            // Also create log entries for each check if needed, 
            // but for now we just save the round summary for the report.
            
            console.log('Round signed off successfully!');
            // alert('Round signed off successfully!');
        } catch (error) {
            console.error('Failed to sign off round:', error);
            // alert('Failed to sign off round. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentUser = {
        signature_image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/John_Hancock_signature.png'
    };

    return {
        categoryAnimals,
        isLoading,
        roundType,
        setRoundType,
        activeTab,
        setActiveTab,
        checks,
        progress,
        isComplete,
        isNoteRequired,
        signingInitials,
        setSigningInitials,
        generalNotes,
        setGeneralNotes,
        isSubmitting,
        isPastRound,
        toggleWater,
        toggleSecure,
        toggleHealth,
        handleSignOff,
        currentUser,
        completedChecks,
        totalAnimals
    };
}
