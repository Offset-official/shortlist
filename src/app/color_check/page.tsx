import React from 'react';
import { ModeToggle } from '@/components/mode-toggle';
const Page=()=> {
  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="text-3xl font-bold mb-6 flex gap-4    ">Theme Variables      

<ModeToggle />
</div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Background */}
        <div className="p-4 rounded-lg border border-border shadow-md bg-background">
          <p className="font-semibold text-foreground">--color-background</p>
          <p className="text-sm text-muted-foreground">bg-background</p>
        </div>
        
        {/* Foreground */}
        <div className="p-4 rounded-lg border border-border shadow-md bg-foreground">
          <p className="font-semibold text-background">--color-foreground</p>
          <p className="text-sm text-background/70">text-foreground</p>
        </div>
        
        {/* Primary */}
        <div className="p-4 rounded-lg border border-border shadow-md bg-primary">
          <p className="font-semibold text-primary-foreground">--color-primary</p>
          <p className="text-sm text-primary-foreground/70">bg-primary</p>
        </div>
        
        {/* Secondary */}
        <div className="p-4 rounded-lg border border-border shadow-md bg-secondary">
          <p className="font-semibold text-secondary-foreground">--color-secondary</p>
          <p className="text-sm text-secondary-foreground/70">bg-secondary</p>
        </div>
        
        {/* Accent */}
        <div className="p-4 rounded-lg border border-border shadow-md bg-accent">
          <p className="font-semibold text-accent-foreground">--color-accent</p>
          <p className="text-sm text-accent-foreground/70">bg-accent</p>
        </div>
        
        {/* Muted */}
        <div className="p-4 rounded-lg border border-border shadow-md bg-muted">
          <p className="font-semibold text-muted-foreground">--color-muted</p>
          <p className="text-sm text-muted-foreground/70">bg-muted</p>
        </div>
        
        {/* Card */}
        <div className="p-4 rounded-lg border border-border shadow-md bg-card">
          <p className="font-semibold text-card-foreground">--color-card</p>
          <p className="text-sm text-card-foreground/70">bg-card</p>
        </div>
        
        {/* Destructive */}
        <div className="p-4 rounded-lg border border-border shadow-md bg-destructive">
          <p className="font-semibold text-destructive-foreground">--color-destructive</p>
          <p className="text-sm text-destructive-foreground/70">bg-destructive</p>
        </div>
        
        {/* Border visualization */}
        <div className="p-4 rounded-lg border-4 border-border shadow-md bg-background">
          <p className="font-semibold text-foreground">--color-border</p>
          <p className="text-sm text-muted-foreground">border-border</p>
        </div>
        
        {/* Ring visualization */}
        <div className="p-4 rounded-lg border border-border shadow-md bg-background outline-4 outline-ring">
          <p className="font-semibold text-foreground">--color-ring</p>
          <p className="text-sm text-muted-foreground">outline-ring</p>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold my-6">Main Colors</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <div className="h-24 rounded-lg shadow-md flex items-end p-2 text-white bg-primary">
          <p className="font-semibold">--primary</p>
        </div>
        <div className="h-24 rounded-lg shadow-md flex items-end p-2" style={{ backgroundColor: 'var(--secondary)', color: '#fff' }}>
          <p className="font-semibold">--secondary</p>
        </div>
        <div className="h-24 rounded-lg shadow-md flex items-end p-2" style={{ backgroundColor: 'var(--tertiary)', color: '#fff' }}>
          <p className="font-semibold">--tertiary</p>
        </div>
        <div className="h-24 rounded-lg shadow-md flex items-end p-2 text-foreground bg-tertiary-1">
          <p className="font-semibold">--tertiary_1</p>
        </div>
        <div className="h-24 rounded-lg shadow-md flex items-end p-2 text-foreground bg-tertiary-2">
          <p className="font-semibold">--tertiary_2</p>
        </div>
      </div>
      
      {/* Sidebar section */}
      <h2 className="text-2xl font-bold my-6">Sidebar Colors</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-sidebar-border shadow-md" style={{ backgroundColor: 'var(--sidebar)', color: 'var(--sidebar-foreground)' }}>
          <p className="font-semibold">--color-sidebar</p>
          <p className="text-sm" style={{ color: 'var(--sidebar-foreground)' }}>bg-sidebar</p>
        </div>
        <div className="p-4 rounded-lg border border-sidebar-border shadow-md" style={{ backgroundColor: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }}>
          <p className="font-semibold">--color-sidebar-primary</p>
          <p className="text-sm" style={{ color: 'var(--sidebar-primary-foreground)' }}>bg-sidebar-primary</p>
        </div>
        <div className="p-4 rounded-lg border border-sidebar-border shadow-md" style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--sidebar-accent-foreground)' }}>
          <p className="font-semibold">--color-sidebar-accent</p>
          <p className="text-sm" style={{ color: 'var(--sidebar-accent-foreground)' }}>bg-sidebar-accent</p>
        </div>
        <div className="p-4 rounded-lg border-4 border-sidebar-border shadow-md" style={{ backgroundColor: 'var(--sidebar)', color: 'var(--sidebar-foreground)' }}>
          <p className="font-semibold">--color-sidebar-border</p>
          <p className="text-sm" style={{ color: 'var(--sidebar-foreground)' }}>border-sidebar-border</p>
        </div>
      </div>
      

    </div>
  );
}


export default Page;