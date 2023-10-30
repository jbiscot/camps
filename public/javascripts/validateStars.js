const reviewForm = document.querySelector(".reviewForm");
const defaultStarInput = document.querySelector("input[name='review[rating]']");
const statusContainer = document.querySelector("#status");
const allStarInputs = document.querySelectorAll("input[name='review[rating]']");

if (reviewForm) {
	reviewForm.addEventListener("submit", function (e) {
		if (defaultStarInput.checked) {
			statusContainer.classList.remove("d-none");
			e.preventDefault();
		}
	});
}

allStarInputs.forEach(star => {
	star.addEventListener("click", function (e) {
		if (star.checked) {
			statusContainer.classList.add("d-none");
		}
	});
});