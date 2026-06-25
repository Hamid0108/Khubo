// @context: Logout confirmation modal — separated from Profile.tsx
// @purpose: Confirms user wants to log out; calls onConfirm on confirmation, onClose on cancel
// @behavior: Shows "Are you sure?" with Cancel and Logout buttons; backdrop click closes
// @dependencies: motion



interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        className="relative w-full max-w-[400px] bg-white p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl z-10 flex flex-col"
      >
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">Are you absolutely sure?</h2>
        <p className="text-neutral-500 mb-8 text-sm md:text-base">
          This action cannot be undone. This will permanently log you out of your account and remove your active session from our servers.
        </p>
        <div className="flex gap-3 mt-auto">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-[#0A2B4E] hover:bg-[#153a66] text-white rounded-xl font-bold transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
