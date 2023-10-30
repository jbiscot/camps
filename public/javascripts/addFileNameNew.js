function previewImages() {
	var preview = document.querySelector('#formFileAddImages');

	if(this.files) {
		[].forEach.call(this.files, readAndPreview);
	}

	function readAndPreview(file) {
		if (!/\.(jpe?g|png|gif)$/i.test(file.name)) {
			return alert(file.name + " is not an image.");
		}

		var reader = new FileReader();

		reader.addEventListener("load", function() {
			var image = new Image();
			image.title = file.name;
			image.src = this.result;

			preview.appendChild(image);
		});

		reader.readAsDataURL(file);
	}
}

document.querySelector('#file-input').addEventListener("change", previewImages);

//from: https://stackoverflow.com/questions/39439760/preview-images-before-upload