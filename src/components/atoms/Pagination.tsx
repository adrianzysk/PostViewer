import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { device } from '@/src/styles/breakpoints';

const Wrapper = styled.nav`
    display: flex;
    flex-wrap: wrap;
    margin: 15px 0;
`;

const Pagin = styled.button<{ active?: boolean }>`
    font-size: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    margin: 5px;
    background-color: white;
    border: 2px solid black;
    border-radius: 5px;
    &:hover {
        opacity: 0.8;
        color: #328efe;
    }
    @media ${device.tablet} {
        width: 50px;
        height: 50px;
    }
    ${(props) =>
        props.active &&
        `
            background-color: #328efe;
            color: white;
            &:hover {
                color: white;
                opacity: 1;
            }
        `}
`;

export const Pagination: React.FC<{
    total: number;
    selected: number;
}> = ({ total, selected }) => {
    const router = useRouter();
    const arr = Array.from({ length: Math.floor(Math.min(total / 20, 50)) }, (_, index) => index + 1);
    const selectionFunction = (page: number) => {
        router.replace(`/${page}`, undefined, { scroll: false });
    };
    return (
        <Wrapper>
            {arr.map((page) => {
                return page == selected ? (
                    <Pagin active key={page}>
                        {page}
                    </Pagin>
                ) : (
                    <Pagin key={page} onClick={() => selectionFunction(page)}>
                        {page}
                    </Pagin>
                );
            })}
        </Wrapper>
    );
};
