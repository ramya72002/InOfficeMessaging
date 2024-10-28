import React from 'react';
import {ShowGroupModalProps} from '../../../../utils/interfaces/type'

const ShowGroupModal: React.FC<ShowGroupModalProps> = ({
    show,
    onClose,
    groupName,
    setGroupName,
    selectedMembers,
    setSelectedMembers,
    filteredRecords,
    searchQuery,
    setSearchQuery,
    handleSelectAll,
    selectAll,
    handleCreateGroup,
}) => {
    if (!show) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close-button" onClick={onClose}>&times;</span>
                <h2 className="modal-title">Create Group</h2>
                <input
                    type="text"
                    className="group-name-input"
                    placeholder="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                />
                <h3 className="members-title">Select Members</h3>
                <input
                    type="text"
                    className="member-search-input"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="select-all-container">
                    <label className="select-all-label">
                        <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                        />
                        Select All
                    </label>
                </div>
                <ul className="members-list">
                    {filteredRecords.map((record) => (
                        <li key={record.email} className="member-item">
                            <label className="member-label">
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.includes(record.email)}
                                    onChange={() => {
                                        const isSelected = selectedMembers.includes(record.email);
                                        setSelectedMembers(isSelected 
                                            ? selectedMembers.filter((email) => email !== record.email)
                                            : [...selectedMembers, record.email]);
                                    }}
                                />
                                {record.name} ({record.email})
                            </label>
                        </li>
                    ))}
                </ul>
                <button className="create-group-button" onClick={handleCreateGroup}>
                    Create Group
                </button>
            </div>
        </div>
    );
};

export default ShowGroupModal;
