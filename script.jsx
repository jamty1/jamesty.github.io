/*
This class contains the json data as well as handles the inputs into the search form. 
*/
class SearchForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {data: [], results_title: [], results_body: []}
		this.recordInput = this.recordInput.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
		this.onSearch = this.onSearch.bind(this);
	}
	
	// Grabs the json data from the Toronto Waste Wizard Lookup.
	componentDidMount() {
		fetch('https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000')
			.then((response) => response.json())
				.then((jsondata) => {
					this.setState({data: jsondata});
					for (var i = 0; i < this.state.data.length; i++) {
						this.state.data[i].favourite = false;
					}
				});
	}
	
	// Runs the search if the user has pressed the Enter key.
	handleKeyPress(event) {
		if (event.key === "Enter") {
			this.onSearch();
		}
	}
	
	// Records all typed input into the state.
	recordInput(event) {
		this.setState({input: event.target.value.toLowerCase()}, () => {
			if (this.state.input == "") {
				this.setState({results_title: [], results_body: []});
			}
		});
	}
	
	// Searches the json data for keyword matches and updates the result states.
	onSearch() {
		var input = this.state.input;
		var title = [];
		var body = [];
		this.state.data.map((item, key) => {
			if (item.keywords.includes(input)) {
				title.push(item.title);
				body.push(item.body);
			}
		});
		this.setState({results_title: title, results_body: body});
	}
	
	render() {
		return (
			<div onKeyDown={(e) => this.handleKeyPress(e)}>
				<input type="text" id="search-input" placeholder="Search for waste and find where they need to go..." onChange={this.recordInput}></input>
				<button type="button" id="search-button" onClick={this.onSearch}>
					<i class="fa fa-search"></i>
				</button>
				<SearchResults results_title={this.state.results_title} results_body={this.state.results_body} />
			</div>
		);
	}
}

/*
This class handles displaying the search results.
*/
class SearchResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {favourites: [], hasFavourite: false};
		this.addFavourite = this.addFavourite.bind(this);
		this.removeInFavourites = this.removeInFavourites.bind(this);
		this.checkInFavourites = this.checkInFavourites.bind(this);
	}
	
	// Decodes the given text as html.
	htmlDecode(text){
		var div = document.createElement('div');
		div.innerHTML = text;
		return div.childNodes.length === 0 ? "" : div.childNodes[0].nodeValue;
	}
	
	// Removes the given item in the list of favourites if it is favourited.
	removeInFavourites(item) {
		for (var i = 0; i < this.state.favourites.length; i++) {
			if (this.state.favourites[i].title == item.title) {
				this.state.favourites.splice(i, 1);
				return true;
			}
		}
		return false;
	}
	
	// Checks if the given item is in the list of favourites.
	checkInFavourites(item) {
		for (var i = 0; i < this.state.favourites.length; i++) {
			if (this.state.favourites[i].title == item.title) {
				return true;
			}
		}
		return false;
	}
	
	// Adds a new favourite into the list of favourites.
	// If the item is already a favourite, the item is removed instead.
	addFavourite(title, body) {
		var newObject = {};
		newObject.title = title;
		newObject.body = body;
		if (!this.removeInFavourites(newObject)) {
			this.state.favourites.push(newObject);
		}
		// Update the state to indicate that there are items in the list of favourites.
		// This will be used to indicate whether we should render the favourites list or not.
		if (this.state.favourites.length > 0) {
			this.setState({hasFavourites: true});
		} else {
			this.setState({hasFavourites: false});
		}
	}
	
	// Renders the results of the search.
	// Favourites will only be rendered if the user has indicated a favourite.
	// Star colour is determined by checking if the item is in the list of favourites.
	render() {
		return(
			<div>
			<table class="search" id="search-results">
				{this.props.results_title.map((item, key) => 
					<tr>
						<td class="results" id="results-title">
							{this.checkInFavourites({title: item, body: this.props.results_body[key]}) ?
							<span id="star-active" onClick={() => this.addFavourite(item, this.props.results_body[key])}> &#x2605;</span>
							: <span id="star" onClick={() => this.addFavourite(item, this.props.results_body[key])}> &#x2605;</span>}
							{item}
						</td>
						<td class="results" id="results-body">
							<span dangerouslySetInnerHTML={{__html: this.htmlDecode(this.props.results_body[key])}}></span>
						</td>
					</tr>
				)}
			</table>
			{this.state.hasFavourites ? <Favourites favourites={this.state.favourites} 
				addFavourite={this.addFavourite} htmlDecode={this.htmlDecode}/> : null}
			</div>
		);
	}
}

/*
This class handles displaying the list of favourites.
*/
class Favourites extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div>
			<table>
				<h1 id="favourites">Favourites</h1>
				{this.props.favourites.map((item, key) =>
					<tr>
						<td class="results" id="results-title">
							<span id="star-active" onClick={() => this.props.addFavourite(item.title, item.body)}>&#x2605;</span>
							{item.title}
						</td>
						<td class="results" id="results-body">
							<span dangerouslySetInnerHTML={{__html: this.props.htmlDecode(item.body)}}></span>
						</td>
					</tr>
				)}
			</table>
			</div>
		);
	}
}

ReactDOM.render(<SearchForm />, document.getElementById("search-form"));