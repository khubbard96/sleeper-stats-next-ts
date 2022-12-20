import React from 'react';
import Navbar from './Navbar';

const Layout: React.FC<{children: JSX.Element}> = ({children}) => {
    return(
        <div className='container-fluid p-0'>
            <Navbar />
            <main>
                {children}
            </main>
        </div>
    )
}

export default Layout;