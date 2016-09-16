const _uOF = {};

_uOF.suggestions = {};
_uOF.searches = {};

_uOF.get = (query, type, cb) => {
	let url = null;

	if(type == 'search') {
		url = 'https://en.wikipedia.org/w/api.php?format=json&origin=*' +
					'&action=query&generator=search&gsrsearch=' + query + '&prop=' +
					'extracts&exintro&explaintext&exsentences=1&exlimit=max';
	}
	else {
		url = 'https://en.wikipedia.org/w/api.php?action=' + 
					'opensearch&search=' + query + '&origin=*&format=json';
	}

	const xhr = new XMLHttpRequest();

	xhr.onload = () => cb(null, xhr.responseText);
	xhr.onerror = (err) => cb(err);

	xhr.open('GET', encodeURI(url));
	xhr.send(null);
};

const $ = (x) => {
	const selected = document.querySelectorAll(x);
	if(selected.length === 0) return null;
	return selected.length === 1 ? selected[0] : Array.from(selected);
}

_uOF.showSearch = (data) => {
	if(!data.hasOwnProperty('query')) return alert('No results');

	if($('section')[1]) $('section')[1].remove();

	const section = document.createElement('section');

	const entries = data.query.pages;
	const keys = Object.keys(entries).sort((a,b) =>
		entries[a].title > entries[b].title);

	keys.forEach(x => {
		const anchor = document.createElement('a');
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');

		anchor.classList.add('wiki');
		anchor.href = 'http://en.wikipedia.org/?curid=' + x;
		anchor.target = '_blank';

		p1.appendChild(document.createTextNode(entries[x].title));
		p2.appendChild(document.createTextNode(entries[x].extract));

		anchor.insertAdjacentElement('beforeend', p1);
		anchor.insertAdjacentElement('beforeend', p2);
		section.insertAdjacentElement('beforeend', anchor);
	});

	$('main').insertAdjacentElement('beforeend', section);
};

_uOF.showSuggestions = (data) => {
	if(data[1].length === 0) {
		if($('div.suggestions')) $('div.suggestions').remove();
		$('input').classList.remove('suggestions');
		return;
	}

	const suggElement = document.createElement('div');
	suggElement.classList.add('suggestions')

	suggElement.onmouseover = (e) => {
		if(e.target.tagName === 'DIV') return;

		const current = $('.current');
		if(current !== null) current.classList.remove('current');
		e.target.classList.add('current');
	};

	data[1].forEach(x => {
		const p = document.createElement('p');
		p.appendChild(document.createTextNode(x));
		p.classList.add('suggestion');
		p.onclick = (e) => {
			$('input').value = e.target.textContent;
			$('input').onkeyup(
				{'target':{'value':e.target.textContent},'key':'Enter'}
			)
			if($('div.suggestions')) $('div.suggestions').remove();
		};
		suggElement.insertAdjacentElement('beforeend', p);
	});

	$('header').classList.add('hidden');

	if($('div.suggestions')) $('div.suggestions').remove();
	else $('input').classList.add('suggestions');
	$('button').insertAdjacentElement('afterend', suggElement);
};

_uOF.searchWiki = (query, type) => {
	_uOF.get(query, type, (err, data) => {
		if(err) return console.log(err);
		
		data = JSON.parse(data);

		if(type == 'opensearch') {
			_uOF.showSuggestions(data);
			_uOF.suggestions[query] = data;
		}
		else {
			console.log(data);
			_uOF.showSearch(data);
			_uOF.searches[query] = data;
		}
	});
};

$('icon').onclick = (e) => {
	e.target.classList.add('hidden');
	e.target.nextElementSibling.focus();
};

$('input').onkeyup = (e) => {
	let value = e.target.value;
	console.log(e.key);
	if(value === '') {
		if(e.key == 'Backspace') return $('button').click();
		if($('div.suggestions')) $('div.suggestions').remove();
		$('input').classList.remove('suggestions');
		return;
	}

	if(e.key === 'Enter') {
		const current = $('.current');

		if(current !== null) {
			value = current.textContent;
			$('input')['value'] = value;
		}

		$('input').classList.remove('suggestions');
		if($('div.suggestions') !== null) $('div.suggestions').remove();

		if(_uOF.searches.hasOwnProperty(value)) {
			_uOF.showSearch(_uOF.searches[value]);
		}
		else {
			_uOF.searchWiki(value, 'search');
		}

		$('header').classList.add('hidden');
	}
	else if(e.key === 'ArrowUp' || e.key === 'ArrowDown') {
		if($('.suggestion') === null) return;
		if($('div.suggestions > p').length < 2) return;

		const currentSugg = $('.current');

		if(currentSugg !== null) {
			currentSugg.classList.remove('current');
			if(e.key === 'ArrowUp') {
				const prevElement = currentSugg.previousElementSibling;
				if(prevElement !== null){
					prevElement.classList.add('current');
				}
				else {
					const children = currentSugg.parentElement.children;
					children[children.length - 1].classList.add('current');
				}
			}
			else {
				const nextElement = currentSugg.nextElementSibling;
				if(nextElement !== null) {
					nextElement.classList.add('current');
				}
				else {
					currentSugg.parentElement.children[0].classList.add('current');
				}
			}
		}
		else {
			$('div.suggestions').children[0].classList.add('current');
		}
	}
	else {
		if(_uOF.suggestions.hasOwnProperty(value)) {
			_uOF.showSuggestions(_uOF.suggestions[value]);
		}
		else {
			_uOF.searchWiki(value, 'opensearch');
		}
	}
};

$('button').onclick = (e) => {
	if($('div.suggestions')) {
		$('input').classList.remove('suggestions');
		return $('div.suggestions').remove();
	}
	$('icon').classList.remove('hidden');
	$('input').value = '';
	if($('section')[1]) $('section')[1].remove();
	$('header').classList.remove('hidden');
};