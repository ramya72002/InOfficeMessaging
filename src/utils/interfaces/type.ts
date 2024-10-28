export interface Record {
    name: string;
    email: string;
    company_name: string;
    phone: number;
    provider: string;
    signup_date: {
        $date: string;
    };
}
export interface Group {
    group_name: string;
    _id: string;
}

export interface Message {
    sender: string;
    message: string;
    timestamp: Date;
}
export interface ShowGroupModalProps {
    show: boolean;
    onClose: () => void;
    groupName: string;
    setGroupName: (name: string) => void;
    selectedMembers: string[];
    setSelectedMembers: (members: string[]) => void;
    filteredRecords: Record[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSelectAll: () => void;
    selectAll: boolean;
    handleCreateGroup: () => Promise<void>;
}

