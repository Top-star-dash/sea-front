import type { Metadata } from 'next';
export const metadata: Metadata = {
   title: 'Home Page',
}
export default function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      hello
    </div>
  );
}
