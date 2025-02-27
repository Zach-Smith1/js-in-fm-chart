import { useEffect } from "react";

const useObserveDiv = () => {
  useEffect(() => {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          const targetDiv = Array.from(document.querySelectorAll("div")).find(
            (div) => div.innerText.trim() === "MUI X Missing license key"
          );

          if (targetDiv) {
            targetDiv.style.display = "none"; // Example: Change text color
            observer.disconnect(); // Stop observing once found
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true, // Observe deep changes
    });

    return () => observer.disconnect(); // Cleanup on unmount
  }, []);
};

export default useObserveDiv;
