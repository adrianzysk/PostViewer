import styled from '@emotion/styled';
import placeholder from '@/public/images/placeholder.png';

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
    margin: 5px 5px;
    background-color: white;
`;

const ImgWrapper = styled.div`
    padding: 20px;
    img {
        width: 200px;
        height: 150px;
        @media (max-width: 768px) {
            width: 100px;
            height: 50px;
        }
    }
    @media (max-width: 768px) {
        padding: 5px;
    }
`;

const TextPost = styled.div`
    padding-top: 20px;
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
    h4 {
        margin: 20px 0;
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
        @media (max-width: 768px) {
            width: 100px;
            height: 35px;
        }
    }
    @media (max-width: 768px) {
        padding-top: 5px;
        p {
            margin: 5px 0;
        }
        h4 {
            margin: 5px 0;
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
                        <h4>{item.user.username}</h4>
                        <button>Komentarze</button>
                    </TextPost>
                </Post>
            ))}
        </Wrapper>
    );
};
