import assistantImg from '@/assets/paulmichael.png';

export default function BotAvatar({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        relative
        cursor-pointer
        select-none
        w-[250px]
        h-[190px]
        object-contain
        bg-transparent
        shadow-none
        rounded-none
      "
    >
      <img
        src={assistantImg}
        alt="AI Commander"
        className="
          w-full
          h-full
          object-cover
          pointer-events-none
        "
        draggable={false}
      />
    </div>
  );
}
