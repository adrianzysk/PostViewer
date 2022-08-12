import styled from '@emotion/styled';
import placeholder from '@/public/placeholder.png';
import { device } from '@/src/styles/breakpoints';

interface PostProps {
    id: string;
    title: string;
    body: string;
    user: {
        username: string;
    };
}

const Wrapper = styled.section`
    display: flex;
    flex-direction: column;
    background-color: #d5dbdb;
    margin-top: 5px;
`;

const Post = styled.div`
    display: flex;
    flex-direction: column;
    margin: 5px 5px;
    background-color: white;
    @media ${device.tablet} {
        flex-direction: row;
    }
`;

const ImgWrapper = styled.div`
    padding: 20px;
    margin: auto;
    img {
        width: 300px;
        height: 200px;
    }
    @media ${device.tablet} {
        padding: 5px;
    }
`;

const TextPost = styled.div`
    padding: 20px;
    margin: 5px 0;
    h3 {
        color: #328efe;
        &:hover {
            opacity: 0.8;
            cursor: pointer;
        }
    }
    p {
        margin: 20px 0;
    }
    .user {
        font-size: 20px;
        color: gray;
    }
    button {
        font-size: 15px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 150px;
        height: 50px;
        margin: 10px 0;
        background-color: white;
        border: 2px solid black;
        border-radius: 5px;
        &:hover {
            opacity: 0.8;
            color: #328efe;
        }
        @media ${device.tablet} {
            width: 150px;
            height: 50px;
        }
    }
`;

export const Page: React.FC<{ selectedPosts: Array<PostProps> }> = ({ selectedPosts }) => {
    return (
        <Wrapper>
            {selectedPosts?.map((item: PostProps) => (
                <Post key={item.id}>
                    <ImgWrapper>
                        <img src={placeholder.src} alt="placeholder" />
                    </ImgWrapper>
                    <TextPost>
                        <h3>{item.title}</h3>
                        <p>{item.body}</p>
                        <p className="user">{item.user.username}</p>
                        <button>Comments</button>
                    </TextPost>
                </Post>
            ))}
        </Wrapper>
    );
};
