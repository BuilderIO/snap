type HomeProps = { text?: string };

export const getInitialProps = async (contexy: any) => {
  return { text: 'Hello' };
};

export default function HomePage(props: HomeProps) {
  return <div>{props.text}</div>;
}
