import TabBar from '../components/TabBar';
import './placeholder.css';

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="screen">
      <div className="ph-body">
        <div className="ph-emoji">🚧</div>
        <h2>{title}</h2>
        <p>이 화면은 다음 단계에서 옮길 예정이에요.</p>
        <p className="ph-sub">지금은 Q&amp;A 화면만 웹으로 이전했어요.</p>
      </div>
      <TabBar />
    </div>
  );
}
