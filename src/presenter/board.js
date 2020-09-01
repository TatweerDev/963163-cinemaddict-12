import ProfileRating from "../view/profile-rating.js";
import SortList from "../view/sort.js";
import NavBoard from "../view/nav-board.js";
import StatsFilter from "../view/stats-filters.js";
import CardBoard from "../view/card-board.js";
import NoData from "../view/no-data.js";
import Card from "../view/film-card.js";
import CardPopup from "../view/popup-card.js";
import ShowMore from "../view/load-more-button.js";
import TopRatedContainer from "../view/top-rated.js";
import MostCommentedContainer from "../view/most-commented.js";
import {generateFilters} from "../mock/filters.js";
import {generateCard} from "../mock/card.js";
import {renderElement, RenderPosition, removeElement} from "../utils/render.js";

const CARDS_COUNT = 21;
const CARDS_IN_BLOCK_COUNT = 2;
const TASK_COUNT_PER_STEP = 5;

export default class Board {
  constructor(boardContainer, headerContainer, documentBodyContainer) {
    this._documentBodyContainer = documentBodyContainer;
    this._boardContainer = boardContainer;
    this._headerContainer = headerContainer;

    this._cardListComponent = new Array(CARDS_COUNT).fill().map(generateCard);
    this._profileComponent = new ProfileRating();
    this._sortListComponent = new SortList();
    this._navBoardComponent = new NavBoard();
    this._cardBoardComponent = new CardBoard();
    this._noFilmCardComponent = new NoData();
    this._showMoreComponent = new ShowMore();
    this._topRatedComponent = new TopRatedContainer();
    this._mostViewedComponent = new MostCommentedContainer();
  }

  // Метод инициализации модуля
  init() {
    this._renderIcon()
    this._renderStats()
    this._renderCardBoard()
    this._renderExtraContainers()
  }

  // Метод рендеринга иконки профиля
  _renderIcon() {
    renderElement(this._headerContainer, this._profileComponent, RenderPosition.BEFOREEND);
  }

  // Метод рендеринга меню статистики и сортировки
  _renderStats() {
    const filters = generateFilters(this._cardListComponent);
    this._statsComponent = new StatsFilter(filters);
    renderElement(this._boardContainer, this._navBoardComponent, RenderPosition.BEFOREEND);
    renderElement(this._navBoardComponent, this._statsComponent, RenderPosition.AFTERBEGIN);

    this._renderSortMenu()
  }

  _renderSortMenu() {
    renderElement(this._boardContainer, this._sortListComponent, RenderPosition.BEFOREEND);
  }

  // Метод для рендеринга доски для карточек фильмов
  _renderCardBoard() {
    if (this._cardListComponent.length === 0) {
      renderElement(this._boardContainer, this._noFilmCardComponent, RenderPosition.BEFOREEND);
    } else {
      renderElement(this._boardContainer, this._cardBoardComponent, RenderPosition.BEFOREEND);
    }

    this._renderCard()
    this._renderShowMoreButton()
  }

  // Метод создания карточек фильмов
  _createCard(cardListElement, content) {
    this._filmCardComponent = new Card(content);
    this._filmPopupComponent = new CardPopup(content);

    const onEscKeyDown = (evt) => {
      if (evt.key === `Escape` || evt.key === `Esc`) {
        evt.preventDefault();
        removeElement(this._filmPopupComponent);
        document.removeEventListener(`keydown`, onEscKeyDown);
      }
    };

    renderElement(cardListElement, this._filmCardComponent, RenderPosition.BEFOREEND);

    this._filmCardComponent.setShowPopupHandler(() => {
      renderElement(this._documentBodyContainer, this._filmPopupComponent, RenderPosition.BEFOREEND);
      document.addEventListener(`keydown`, onEscKeyDown);
      this._filmPopupComponent.setClosePopupHandler(() => {
        removeElement(this._filmPopupComponent);
        document.removeEventListener(`keydown`, onEscKeyDown);
      });
    });
  }

  // Метод рендеринга карточек фильмов
  _renderCard() {
    const filmCardContainer = this._boardContainer.querySelector(`.films-list__container`);
    for (let i = 0; i < Math.min(this._cardListComponent.length, TASK_COUNT_PER_STEP); i++) {
      this._createCard(filmCardContainer, this._cardListComponent[i]);
    }
  }

  // Метод рендеринга кнопки допоказа карточек
  _renderShowMoreButton() {
    if (this._cardListComponent.length > TASK_COUNT_PER_STEP) {
      let renderedTaskCount = TASK_COUNT_PER_STEP;
      const filmList = this._boardContainer.querySelector(`.films-list`);
      const filmCardContainer = this._boardContainer.querySelector(`.films-list__container`);
    
      renderElement(filmList, this._showMoreComponent, RenderPosition.BEFOREEND);
    
      this._showMoreComponent.setClickHandler(() => {
        this._cardListComponent
        .slice(renderedTaskCount, renderedTaskCount + TASK_COUNT_PER_STEP)
        .forEach((card) => this._createCard(filmCardContainer, card));
    
        renderedTaskCount += TASK_COUNT_PER_STEP;
    
        if (renderedTaskCount >= this._cardListComponent.length) {
          removeElement(this._showMoreComponent);
        }
      });
    }
  }

  // Мeтод рендеринга контейнеров для Top Rated и Most Commented фильмов
  _renderExtraContainers () {
    renderElement(this._cardBoardComponent, this._topRatedComponent, RenderPosition.BEFOREEND);
    renderElement(this._cardBoardComponent,  this._mostViewedComponent, RenderPosition.BEFOREEND);

    this._renderExtraCards()
  }

  // Метод рендеринга карточек фильмов в Top Rated и Most Commented
  _renderExtraCards () {
    const filmListExtra = this._documentBodyContainer.querySelectorAll(`.films-list--extra`);

    filmListExtra.forEach((element) => {
      for (let i = 0; i < CARDS_IN_BLOCK_COUNT; i++) {
        this._filmCardComponent = new Card(this._cardListComponent[i]);
        this._createCard(element.querySelector(`.films-list__container`), this._filmCardComponent);
      }
    });
  }
}

