import React from 'react';
import styled from '@emotion/styled';
import { CustomHelmet } from '@/src/components';
import Link from 'next/link';
import logo from '@/public/images/logo.png';

export const siteTitle = 'Next.js Sample Website';

interface LayoutProps {
    home?: boolean;
    pageTitle?: string;
}

const Header = styled.header`
    display: flex;
    height: 80px;
    width: 100%;
    background-color: #328efe;
    align-items: center;
    justify-content: center;
    position: fixed;
`;

const HeaderFix = styled.div`
    height: 80px;
`;

const HeaderWrapper = styled.nav`
    max-width: 1000px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ImgWrapper = styled.img`
    height: 70px;
`;

const AddButton = styled.a`
    font-size: 30px;
    padding: 30px;
    height: 80px;
    display: flex;
    align-items: center;
    color: white;
    &:hover {
        text-decoration: none;
        opacity: 0.8;
        border-bottom: 3px solid white;
    }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: auto;
    max-width: 1000px;
`;

export const Layout: React.FC<LayoutProps> = ({ children, home, pageTitle }) => {
    return (
        <div>
            <CustomHelmet pageTitle={pageTitle ? pageTitle : undefined} />
            <Header>
                <HeaderWrapper>
                    <Link href="/">
                        <a>
                            <ImgWrapper src={logo.src} alt="logo" />
                        </a>
                    </Link>
                    <Link href="/AddPost/AddPost">
                        <AddButton>Dodaj</AddButton>
                    </Link>
                </HeaderWrapper>
            </Header>
            <HeaderFix />
            <Container>{children}</Container>
        </div>
    );
};
