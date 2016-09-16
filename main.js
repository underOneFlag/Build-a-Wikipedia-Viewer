const _uOF = {};

_uOF.get = (query, cb) => {
	const url = 'https://en.wikipedia.org/w/api.php?action=opensearch' +
							'&search=' + query + '&limit=10&format=json';
  const xhr = new XMLHttpRequest();
  xhr.onload = () => cb(null, xhr.responseText);
  xhr.onerror = (err) => cb(err);
  xhr.open('GET', url);
  xhr.send();
};

const $ = (x) => {
	const selected = document.querySelectorAll(x);
	return selected.length === 1 ? selected[0] : Array.from(selected);
}

_uOF.addResults = (data) => {
	if($('section')[1]) oldSection.remove();

	const section = document.createElement('section');

	data[1].forEach((x, i) => {
		console.log(x);

		const anchor = document.createElement('a');
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');

		anchor.classList.add('wiki');
		anchor.href = data[3][i];
		anchor.target = '_blank';

		p1.appendChild(document.createTextNode(x));
		p2.appendChild(document.createTextNode(data[2][i]));

		anchor.insertAdjacentElement('beforeend', p1);
		anchor.insertAdjacentElement('beforeend', p2);
		section.insertAdjacentElement('beforeend', anchor);
	});

	$('main').insertAdjacentElement('beforeend', section);
};

_uOF.searchWiki = (value) => {
	console.log(value);
	_uOF.get(value, (err, data) => {
		if(err) return console.log(err);
		_uOF.addResults(JSON.parse(data));
	});
};

$('icon').onclick = (e) => {
	e.target.classList.add('hidden');
	e.target.nextElementSibling.focus();
};

$('input').onkeyup = (e) => {
	const value = e.target.value;

	if(value === '') return;

	if(e.key === 'Enter') {
		_uOF.searchWiki(value);
		$('header').classList.add('hidden');
	}
};

$('button').onclick = (e) => {
	$('icon').classList.remove('hidden');
	$('input').value = '';
	if($('section')[1]) $('section')[1].remove();
	$('header').classList.remove('hidden');
};