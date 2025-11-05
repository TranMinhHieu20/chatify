import React from 'react'
import { useChatStore } from '../store/useChatStore'

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore()
  return (
    <div role="tablist" className="tabs  tabs-bordered bg-transparent p-2 m-2">
      <button
        role="tab"
        className={`tab  ${activeTab === 'chats' ? 'tab-active' : ''}`}
        onClick={() => setActiveTab('chats')}
      >
        Chats
      </button>
      <button
        role="tab"
        className={`tab ${activeTab === 'chats' ? '' : 'tab-active'}`}
        onClick={() => setActiveTab('contacts')}
      >
        Contacts
      </button>
    </div>
  )
}

export default ActiveTabSwitch
