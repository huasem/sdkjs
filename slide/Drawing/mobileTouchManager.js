/*
 * (c) Copyright Ascensio System SIA 2010-2016
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

"use strict";

(function(window, undefined)
{
	var global_MatrixTransformer = AscCommon.global_MatrixTransformer;
	var g_dKoef_mm_to_pix        = AscCommon.g_dKoef_mm_to_pix;

	var global_mouseEvent    = AscCommon.global_mouseEvent;
	var global_keyboardEvent = AscCommon.global_keyboardEvent;

	/**
	 * @extends {AscCommon.CMobileDelegateEditor}
	 */
	function CMobileDelegateEditorPresentation(_manager)
	{
		CMobileDelegateEditorPresentation.superclass.constructor.call(this, _manager);
	}
	AscCommon.extendClass(CMobileDelegateEditorPresentation, AscCommon.CMobileDelegateEditor);

	CMobileDelegateEditorPresentation.prototype.ConvertCoordsToCursor = function(x, y, page, isGlobal)
	{
		return this.DrawingDocument.ConvertCoordsToCursor(x, y);
	};
	CMobileDelegateEditorPresentation.prototype.ConvertCoordsFromCursor = function(x, y)
	{
		return this.DrawingDocument.ConvertCoordsFromCursor2(x, y);
	};
	CMobileDelegateEditorPresentation.prototype.GetScrollerSize = function()
	{
		return {
			W : (this.DrawingDocument.SlideCurrectRect.right - this.DrawingDocument.SlideCurrectRect.left),
			H : (this.DrawingDocument.SlideCurrectRect.bottom - this.DrawingDocument.SlideCurrectRect.top)
		};
	};
	CMobileDelegateEditorPresentation.prototype.GetObjectTrack = function(x, y, page)
	{
		return this.LogicDocument.Slides[this.LogicDocument.CurPage].graphicObjects.isPointInDrawingObjects(x, y, page);
	};
	CMobileDelegateEditorPresentation.prototype.GetSelectionRectsBounds = function()
	{
		return this.LogicDocument.Slides[this.LogicDocument.CurPage].graphicObjects.Get_SelectionBounds();
	};
	CMobileDelegateEditorPresentation.prototype.ScrollTo = function(_scroll)
	{
		var bIsHorPresent = (this.HtmlPage.m_oScrollHorApi != null);
		if (_scroll.directionLocked == "v")
		{
			this.HtmlPage.m_oScrollVerApi.scrollToY(-_scroll.y);
		}
		else if (_scroll.directionLocked == "h" && bIsHorPresent)
		{
			this.HtmlPage.m_oScrollHorApi.scrollToX(-_scroll.x);
		}
		else if (_scroll.directionLocked == "n")
		{
			if (bIsHorPresent)
				this.HtmlPage.m_oScrollHorApi.scrollToX(-_scroll.x);
			this.HtmlPage.m_oScrollVerApi.scrollToY(-_scroll.y);
		}
	};
	CMobileDelegateEditorPresentation.prototype.GetContextMenuType = function()
	{
		var _mode = AscCommon.MobileTouchContextMenuType.None;

		var _controller = this.LogicDocument.Slides[this.LogicDocument.CurPage].graphicObjects;

		if (!_controller.Is_SelectionUse())
			_mode = AscCommon.MobileTouchContextMenuType.Target;

		if (_controller.Get_SelectionBounds())
			_mode = AscCommon.MobileTouchContextMenuType.Select;

		if (_mode == 0 && _controller.getSelectedObjectsBounds())
			_mode = AscCommon.MobileTouchContextMenuType.Object;

		return _mode;
	};
	CMobileDelegateEditorPresentation.prototype.GetContextMenuPosition = function()
	{
		var _controller = this.LogicDocument.Slides[this.LogicDocument.CurPage].graphicObjects;

		var _posX = 0;
		var _posY = 0;
		var _page = 0;
		var _transform = null;
		var tmpX, tmpY, tmpX2, tmpY2;
		var _pos = null;

		var _mode = 0;

		var _target = _controller.Is_SelectionUse();
		if (_target === false)
		{
			_posX = this.DrawingDocument.m_dTargetX;
			_posY = this.DrawingDocument.m_dTargetY;
			_page = this.DrawingDocument.m_lTargetPage;
			_transform = this.DrawingDocument.TextMatrix;

			if (_transform)
			{
				tmpX = _transform.TransformPointX(_posX, _posY);
				tmpY = _transform.TransformPointY(_posX, _posY);
			}
			else
			{
				tmpX = _posX;
				tmpY = _posY;
			}

			_pos = this.DrawingDocument.ConvertCoordsToCursorWR(tmpX, tmpY, _page);
			_posX = _pos.X;
			_posY = _pos.Y;

			_mode = 1;
		}

		var _select = _controller.Get_SelectionBounds();
		if (_select)
		{
			var _rect1 = _select.Start;
			var _rect2 = _select.End;

			tmpX = _rect1.X;
			tmpY = _rect1.Y;
			tmpX2 = _rect2.X + _rect2.W;
			tmpY2 = _rect2.Y + _rect2.H;

			_transform = this.DrawingDocument.SelectionMatrix;

			if (_transform)
			{
				_posX = _transform.TransformPointX(tmpX, tmpY);
				_posY = _transform.TransformPointY(tmpX, tmpY);

				tmpX = _posX;
				tmpY = _posY;

				_posX = _transform.TransformPointX(tmpX2, tmpY2);
				_posY = _transform.TransformPointY(tmpX2, tmpY2);

				tmpX2 = _posX;
				tmpY2 = _posY;
			}

			_pos = this.DrawingDocument.ConvertCoordsToCursorWR(tmpX, tmpY, _rect1.Page);
			_posX = _pos.X;
			_posY = _pos.Y;

			_pos = this.DrawingDocument.ConvertCoordsToCursorWR(tmpX2, tmpY2, _rect2.Page);
			_posX += _pos.X;
			_posX = _posX >> 1;

			_mode = 2;
		}

		var _object_bounds = _controller.getSelectedObjectsBounds();
		if ((0 == _mode) && _object_bounds)
		{
			_pos = this.DrawingDocument.ConvertCoordsToCursorWR(_object_bounds.minX, _object_bounds.minY, _object_bounds.pageIndex);
			_posX = _pos.X;
			_posY = _pos.Y;

			_pos = this.DrawingDocument.ConvertCoordsToCursorWR(_object_bounds.maxX, _object_bounds.maxY, _object_bounds.pageIndex);
			_posX += _pos.X;
			_posX = _posX >> 1;

			_mode = 3;
		}

		return { X : _posX, Y : _posY, Mode : _mode };
	};

	/**
	 * @extends {AscCommon.CMobileTouchManagerBase}
	 */
	function CMobileTouchManager(_config)
	{
		CMobileTouchManager.superclass.constructor.call(this, _config || {});
	}
	AscCommon.extendClass(CMobileTouchManager, AscCommon.CMobileTouchManagerBase);

	CMobileTouchManager.prototype.Init = function(_api)
	{
		this.Api = _api;

		// создаем делегата. инициализация его - ПОСЛЕ создания iScroll
		this.delegate = new CMobileDelegateEditorPresentation(this);
		var _element = this.delegate.GetScrollerParent();
		this.CreateScrollerDiv(_element);

		this.iScroll = new window.IScroll(_element, {
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true,
			scrollX : true,
			scroller_id : this.iScrollElement,
			bounce : false
		});

		this.delegate.Init();

		if (this.TableTrackEnabled)
			this.LoadMobileImages();
	};

	CMobileTouchManager.prototype.onTouchStart = function(e)
	{
		this.IsTouching = true;

		if (this.delegate.IsReader())
			return this.onTouchStart_renderer(e);

		global_mouseEvent.KoefPixToMM = 5;
		AscCommon.check_MouseDownEvent(e.touches ? e.touches[0] : e, true);
		global_mouseEvent.KoefPixToMM = 1;
		global_mouseEvent.LockMouse();
		this.Api.sendEvent("asc_onHidePopMenu");

		this.TableCurrentMoveValueMin = null;
		this.TableCurrentMoveValueMax = null;

		this.MoveAfterDown = false;
		this.TimeDown      = new Date().getTime();

		var bIsKoefPixToMM = false;
		var _matrix        = this.delegate.GetSelectionTransform();
		if (_matrix && global_MatrixTransformer.IsIdentity(_matrix))
			_matrix = null;

		if (!this.CheckSelectTrack())
		{
			if (!this.CheckTableTrack())
			{
				bIsKoefPixToMM = this.CheckObjectTrack();
			}
		}

		if (e.touches && 2 == e.touches.length)
		{
			this.Mode = AscCommon.MobileTouchMode.Zoom;
		}

		// если не используем этот моус даун - то уменьшаем количество кликов
		switch (this.Mode)
		{
			case AscCommon.MobileTouchMode.None:
			case AscCommon.MobileTouchMode.Scroll:
			case AscCommon.MobileTouchMode.InlineObj:
			case AscCommon.MobileTouchMode.FlowObj:
			case AscCommon.MobileTouchMode.Zoom:
			case AscCommon.MobileTouchMode.Cursor:
			case AscCommon.MobileTouchMode.TableMove:
			{
				// так как был уже check, нужно уменьшить количество кликов
				if (global_mouseEvent.ClickCount > 0)
					global_mouseEvent.ClickCount--;
				break;
			}
			default:
				break;
		}

		switch (this.Mode)
		{
			case AscCommon.MobileTouchMode.None:
			{
				this.Mode      = AscCommon.MobileTouchMode.Scroll;
				this.DownPoint = this.delegate.ConvertCoordsFromCursor(global_mouseEvent.X, global_mouseEvent.Y);

				this.DownPointOriginal.X = global_mouseEvent.X;
				this.DownPointOriginal.Y = global_mouseEvent.Y;

				this.iScroll._start(e);

				break;
			}
			case AscCommon.MobileTouchMode.Scroll:
			{
				// ничего не меняем, просто перемещаем точку
				this.DownPoint           = this.delegate.ConvertCoordsFromCursor(global_mouseEvent.X, global_mouseEvent.Y);
				this.DownPointOriginal.X = global_mouseEvent.X;
				this.DownPointOriginal.Y = global_mouseEvent.Y;

				this.iScroll._start(e);

				break;
			}
			case AscCommon.MobileTouchMode.Select:
			{
				var _x1 = this.RectSelect1.x;
				var _y1 = this.RectSelect1.y + this.RectSelect1.h / 2;

				var _x2 = this.RectSelect2.x + this.RectSelect2.w;
				var _y2 = this.RectSelect2.y + this.RectSelect2.h / 2;

				this.delegate.LogicDocument.Selection_Remove();
				if (1 == this.DragSelect)
				{
					global_mouseEvent.Button = 0;

					if (!_matrix)
					{
						this.delegate.Logic_OnMouseDown(global_mouseEvent, _x2, _y2, this.PageSelect2);
					}
					else
					{
						var __X = _matrix.TransformPointX(_x2, _y2);
						var __Y = _matrix.TransformPointY(_x2, _y2);

						this.delegate.Logic_OnMouseDown(global_mouseEvent, __X, __Y, this.PageSelect2);
					}

					var pos1 = this.delegate.ConvertCoordsFromCursor(global_mouseEvent.X, global_mouseEvent.Y);
					this.delegate.Logic_OnMouseMove(global_mouseEvent, pos1.X, pos1.Y, pos1.Page);
				}
				else if (2 == this.DragSelect)
				{
					global_mouseEvent.Button = 0;

					if (!_matrix)
					{
						this.delegate.Logic_OnMouseDown(global_mouseEvent, _x1, _y1, this.PageSelect1);
					}
					else
					{
						var __X = _matrix.TransformPointX (_x1, _y1);
						var __Y = _matrix.TransformPointY(_x1, _y1);

						this.delegate.Logic_OnMouseDown(global_mouseEvent, __X, __Y, this.PageSelect1);
					}

					var pos4 = this.delegate.ConvertCoordsFromCursor(global_mouseEvent.X, global_mouseEvent.Y);
					this.delegate.Logic_OnMouseMove(global_mouseEvent, pos4.X, pos4.Y, pos4.Page);
				}
				break;
			}
			case AscCommon.MobileTouchMode.InlineObj:
			{
				break;
			}
			case AscCommon.MobileTouchMode.FlowObj:
			{
				if (bIsKoefPixToMM)
				{
					global_mouseEvent.KoefPixToMM = 5;
				}
				this.delegate.Drawing_OnMouseDown(e.touches ? e.touches[0] : e);
				global_mouseEvent.KoefPixToMM = 1;
				break;
			}
			case AscCommon.MobileTouchMode.Zoom:
			{
				this.delegate.HtmlPage.NoneRepaintPages = true;

				var _x1 = (e.touches[0].pageX !== undefined) ? e.touches[0].pageX : e.touches[0].clientX;
				var _y1 = (e.touches[0].pageY !== undefined) ? e.touches[0].pageY : e.touches[0].clientY;

				var _x2 = (e.touches[1].pageX !== undefined) ? e.touches[1].pageX : e.touches[1].clientX;
				var _y2 = (e.touches[1].pageY !== undefined) ? e.touches[1].pageY : e.touches[1].clientY;

				this.ZoomDistance = Math.sqrt((_x1 - _x2) * (_x1 - _x2) + (_y1 - _y2) * (_y1 - _y2));
				this.ZoomValue    = this.delegate.GetZoom();

				break;
			}
			case AscCommon.MobileTouchMode.Cursor:
			{
				this.Mode      = AscCommon.MobileTouchMode.Scroll;
				this.DownPoint = this.delegate.ConvertCoordsFromCursor(global_mouseEvent.X, global_mouseEvent.Y);
				break;
			}
			case AscCommon.MobileTouchMode.TableMove:
			{
				this.delegate.Drawing_OnMouseDown(e.touches ? e.touches[0] : e);
				break;
			}
			case AscCommon.MobileTouchMode.TableRuler:
			{
				this.delegate.HtmlPage.OnUpdateOverlay();
				break;
			}
		}

		if (this.Api.isViewMode)
		{
			if (e.preventDefault)
				e.preventDefault();
			else
				e.returnValue = false;
			return false;
		}
	};
	CMobileTouchManager.prototype.onTouchMove  = function(e)
	{
		if (this.delegate.IsReader())
			return this.onTouchMove_renderer(e);

		if (this.Mode != AscCommon.MobileTouchMode.FlowObj && this.Mode != AscCommon.MobileTouchMode.TableMove)
			AscCommon.check_MouseMoveEvent(e.touches ? e.touches[0] : e);

		if (!this.MoveAfterDown)
		{
			if (Math.abs(this.DownPointOriginal.X - global_mouseEvent.X) > this.MoveMinDist ||
				Math.abs(this.DownPointOriginal.Y - global_mouseEvent.Y) > this.MoveMinDist)
			{
				this.MoveAfterDown = true;
			}
		}

		switch (this.Mode)
		{
			case AscCommon.MobileTouchMode.Cursor:
			{
				this.MoveCursorToPoint(true);
				break;
			}
			case AscCommon.MobileTouchMode.Scroll:
			{
				var _newTime = new Date().getTime();
				if ((_newTime - this.TimeDown) > this.ReadingGlassTime && !this.MoveAfterDown)
				{
					this.Mode = AscCommon.MobileTouchMode.Cursor;
					this.MoveCursorToPoint(false);
				}
				else
				{
					this.iScroll._move(e);
					AscCommon.stopEvent(e);
				}
				break;
			}
			case AscCommon.MobileTouchMode.Zoom:
			{
				if (2 != e.touches.length)
				{
					this.Mode = AscCommon.MobileTouchMode.None;
					return;
				}

				var _x1 = (e.touches[0].pageX !== undefined) ? e.touches[0].pageX : e.touches[0].clientX;
				var _y1 = (e.touches[0].pageY !== undefined) ? e.touches[0].pageY : e.touches[0].clientY;

				var _x2 = (e.touches[1].pageX !== undefined) ? e.touches[1].pageX : e.touches[1].clientX;
				var _y2 = (e.touches[1].pageY !== undefined) ? e.touches[1].pageY : e.touches[1].clientY;

				var zoomCurrentDist = Math.sqrt((_x1 - _x2) * (_x1 - _x2) + (_y1 - _y2) * (_y1 - _y2));

				if (zoomCurrentDist == 0)
					zoomCurrentDist = 1;

				var _zoomFix = this.ZoomValue / 100;
				var _zoomCur = _zoomFix * (zoomCurrentDist / this.ZoomDistance);

				_zoomCur = (_zoomCur * 100) >> 0;
				if (_zoomCur < this.ZoomValueMin)
					_zoomCur = this.ZoomValueMin;
				else if (_zoomCur > this.ZoomValueMax)
					_zoomCur = this.ZoomValueMax;

				this.delegate.SetZoom(_zoomCur);
				AscCommon.stopEvent(e);
				break;
			}
			case AscCommon.MobileTouchMode.InlineObj:
			{
				break;
			}
			case AscCommon.MobileTouchMode.FlowObj:
			{
				this.delegate.Drawing_OnMouseMove(e.touches ? e.touches[0] : e);
				AscCommon.stopEvent(e);
				break;
			}
			case AscCommon.MobileTouchMode.Select:
			{
				// во время движения может смениться порядок ректов
				global_mouseEvent.ClickCount = 1;
				var pos                      = this.delegate.ConvertCoordsFromCursor(global_mouseEvent.X, global_mouseEvent.Y);
				this.delegate.Logic_OnMouseMove(global_mouseEvent, pos.X, pos.Y, pos.Page);
				AscCommon.stopEvent(e);
				break;
			}
			case AscCommon.MobileTouchMode.TableMove:
			{
				this.delegate.Drawing_OnMouseMove(e.touches ? e.touches[0] : e);
				AscCommon.stopEvent(e);
				break;
			}
			case AscCommon.MobileTouchMode.TableRuler:
			{
				var DrawingDocument = this.delegate.DrawingDocument;
				var pos = DrawingDocument.ConvertCoordsFromCursorPage(global_mouseEvent.X, global_mouseEvent.Y, DrawingDocument.TableOutlineDr.CurrentPageIndex);

				var _Transform = null;
				if (DrawingDocument.TableOutlineDr)
					_Transform = DrawingDocument.TableOutlineDr.TableMatrix;

				if (_Transform && !global_MatrixTransformer.IsIdentity(_Transform))
				{
					var _invert = _Transform.CreateDublicate();
					_invert.Invert();

					var __x = _invert.TransformPointX(pos.X, pos.Y);
					var __y = _invert.TransformPointY(pos.X, pos.Y);

					pos.X = __x;
					pos.Y = __y;
				}

				if (this.TableCurrentMoveDir == 0)
				{
					this.TableCurrentMoveValue = pos.X;

					if (null != this.TableCurrentMoveValueMin)
					{
						if (this.TableCurrentMoveValueMin > this.TableCurrentMoveValue)
							this.TableCurrentMoveValue = this.TableCurrentMoveValueMin;
					}
					if (null != this.TableCurrentMoveValueMax)
					{
						if (this.TableCurrentMoveValueMax < this.TableCurrentMoveValue)
							this.TableCurrentMoveValue = this.TableCurrentMoveValueMax;
					}
				}
				else
				{
					this.TableCurrentMoveValue = pos.Y;

					if (null != this.TableCurrentMoveValueMin)
					{
						if (this.TableCurrentMoveValueMin > this.TableCurrentMoveValue)
							this.TableCurrentMoveValue = this.TableCurrentMoveValueMin;
					}
					if (null != this.TableCurrentMoveValueMax)
					{
						if (this.TableCurrentMoveValueMax < this.TableCurrentMoveValue)
							this.TableCurrentMoveValue = this.TableCurrentMoveValueMax;
					}
				}
				this.delegate.HtmlPage.OnUpdateOverlay();

				AscCommon.stopEvent(e);
				break;
			}
			default:
				break;
		}
	};
	CMobileTouchManager.prototype.onTouchEnd   = function(e)
	{
		this.IsTouching = false;

		if (this.delegate.IsReader())
			return this.onTouchEnd_renderer(e);

		var _e = e.changedTouches ? e.changedTouches[0] : e;
		if (this.Mode != AscCommon.MobileTouchMode.FlowObj && this.Mode != AscCommon.MobileTouchMode.TableMove)
		{
			AscCommon.check_MouseUpEvent(_e);
		}

		var isCheckContextMenuMode = true;

		switch (this.Mode)
		{
			case AscCommon.MobileTouchMode.Cursor:
			{
				// ничего не делаем. курсор уже установлен
				this.Mode = AscCommon.MobileTouchMode.None;
				break;
			}
			case AscCommon.MobileTouchMode.Scroll:
			{
				if (!this.MoveAfterDown)
				{
					global_mouseEvent.Button = 0;
					this.delegate.Drawing_OnMouseDown(_e);
					this.delegate.Drawing_OnMouseUp(_e);
					this.Api.sendEvent("asc_onTapEvent", e);
				}
				else
				{
					// нужно запускать анимацию скролла, если она есть
					// TODO:
					isCheckContextMenuMode = false;
					this.iScroll._end(e);
				}

				this.Mode = AscCommon.MobileTouchMode.None;
				break;
			}
			case AscCommon.MobileTouchMode.Zoom:
			{
				// здесь нужно запускать отрисовку, если есть анимация зума
				this.delegate.HtmlPage.NoneRepaintPages = false;
				this.delegate.HtmlPage.m_bIsFullRepaint = true;
				this.delegate.HtmlPage.OnScroll();

				this.Mode = AscCommon.MobileTouchMode.None;
				isCheckContextMenuMode = false;
				break;
			}
			case AscCommon.MobileTouchMode.InlineObj:
			{
				// TODO:
				break;
			}
			case AscCommon.MobileTouchMode.FlowObj:
			{
				// TODO:
				this.delegate.Drawing_OnMouseUp(e.changedTouches ? e.changedTouches[0] : e);
				this.Mode = AscCommon.MobileTouchMode.None;
				break;
			}
			case AscCommon.MobileTouchMode.Select:
			{
				// ничего не нужно делать
				this.DragSelect = 0;
				this.Mode       = AscCommon.MobileTouchMode.None;
				var pos         = this.delegate.ConvertCoordsFromCursor(global_mouseEvent.X, global_mouseEvent.Y);
				this.delegate.Logic_OnMouseUp(global_mouseEvent, pos.X, pos.Y, pos.Page);
				AscCommon.stopEvent(e);
				break;
			}
			case AscCommon.MobileTouchMode.TableMove:
			{
				this.delegate.Drawing_OnMouseUp(e.changedTouches ? e.changedTouches[0] : e);
				this.Mode = AscCommon.MobileTouchMode.None;
				break;
			}
			case AscCommon.MobileTouchMode.TableRuler:
			{
				var HtmlPage = this.delegate.HtmlPage;
				var DrawingDocument = this.delegate.DrawingDocument;

				HtmlPage.StartUpdateOverlay();

				this.Mode = AscCommon.MobileTouchMode.None;

				var _xOffset = HtmlPage.X;
				var _yOffset = HtmlPage.Y;

				if (true === HtmlPage.m_bIsRuler)
				{
					_xOffset += (5 * g_dKoef_mm_to_pix);
					_yOffset += (7 * g_dKoef_mm_to_pix);
				}

				var pos = DrawingDocument.ConvertCoordsFromCursorPage(global_mouseEvent.X, global_mouseEvent.Y, DrawingDocument.TableOutlineDr.CurrentPageIndex);

				var _Transform = null;
				if (DrawingDocument.TableOutlineDr)
					_Transform = DrawingDocument.TableOutlineDr.TableMatrix;

				if (_Transform && !global_MatrixTransformer.IsIdentity(_Transform))
				{
					var _invert = _Transform.CreateDublicate();
					_invert.Invert();

					var __x = _invert.TransformPointX(pos.X, pos.Y);
					var __y = _invert.TransformPointY(pos.X, pos.Y);

					pos.X = __x;
					pos.Y = __y;
				}

				if (this.TableCurrentMoveDir == 0)
				{
					this.TableCurrentMoveValue = pos.X;

					if (null != this.TableCurrentMoveValueMin)
					{
						if (this.TableCurrentMoveValueMin > this.TableCurrentMoveValue)
							this.TableCurrentMoveValue = this.TableCurrentMoveValueMin;
					}
					if (null != this.TableCurrentMoveValueMax)
					{
						if (this.TableCurrentMoveValueMax < this.TableCurrentMoveValue)
							this.TableCurrentMoveValue = this.TableCurrentMoveValueMax;
					}

					var _markup                            = HtmlPage.m_oHorRuler.m_oTableMarkup;
					_markup.Cols[this.TableCurrentMovePos] += (this.TableCurrentMoveValue - this.TableCurrentMoveValueOld);
					_markup.Cols[this.TableCurrentMovePos] = Math.max(_markup.Cols[this.TableCurrentMovePos], 1);

					if ( false === HtmlPage.m_oLogicDocument.Document_Is_SelectionLocked(AscCommon.changestype_Table_Properties) )
					{
						HtmlPage.m_oLogicDocument.Create_NewHistoryPoint(AscDFH.historydescription_Document_SetTableMarkup_Hor);
						_markup.Table.Update_TableMarkupFromRuler(_markup, true, this.TableCurrentMovePos + 1);
						HtmlPage.m_oLogicDocument.Document_UpdateInterfaceState();
					}
				}
				else
				{
					this.TableCurrentMoveValue = pos.Y;

					if (null != this.TableCurrentMoveValueMin)
					{
						if (this.TableCurrentMoveValueMin > this.TableCurrentMoveValue)
							this.TableCurrentMoveValue = this.TableCurrentMoveValueMin;
					}
					if (null != this.TableCurrentMoveValueMax)
					{
						if (this.TableCurrentMoveValueMax < this.TableCurrentMoveValue)
							this.TableCurrentMoveValue = this.TableCurrentMoveValueMax;
					}

					var _markup = HtmlPage.m_oHorRuler.m_oTableMarkup;
					_markup.Rows[this.TableCurrentMovePos].H += (this.TableCurrentMoveValue - this.TableCurrentMoveValueOld);

					if ( false === this.delegate.HtmlPage.m_oLogicDocument.Document_Is_SelectionLocked(AscCommon.changestype_Table_Properties) )
					{
						HtmlPage.m_oLogicDocument.Create_NewHistoryPoint(AscDFH.historydescription_Document_SetTableMarkup_Hor);
						_markup.Table.Update_TableMarkupFromRuler(_markup, false, this.TableCurrentMovePos + 1);
						HtmlPage.m_oLogicDocument.Document_UpdateInterfaceState();
					}
				}

				HtmlPage.OnUpdateOverlay();
				HtmlPage.EndUpdateOverlay();

				break;
			}
			default:
				break;
		}

		if (this.Api.isViewMode)
		{
			if (e.preventDefault)
				e.preventDefault();
			else
				e.returnValue = false;
			return false;
		}

		if (true !== this.iScroll.isAnimating)
			this.CheckContextMenuTouchEnd(isCheckContextMenuMode);
	};


	/**************************************************************************/
	/**
	 * @extends {AscCommon.CMobileDelegateSimple}
	 */
	function CMobileDelegateThumbnails(_manager)
	{
		CMobileDelegateThumbnails.superclass.constructor.call(this, _manager);

		this.HtmlPage 			= this.Api.WordControl;
		this.Thumbnails 		= this.HtmlPage.Thumbnails;
	}
	AscCommon.extendClass(CMobileDelegateThumbnails, AscCommon.CMobileDelegateSimple);

	CMobileDelegateThumbnails.prototype.GetScrollerParent = function()
	{
		return this.HtmlPage.m_oThumbnailsContainer.HtmlElement;
	};
	CMobileDelegateThumbnails.prototype.GetScrollerSize = function()
	{
		return { W : 1, H : this.Thumbnails.ScrollerHeight };
	};
	CMobileDelegateThumbnails.prototype.ScrollTo = function(_scroll)
	{
		this.HtmlPage.m_oScrollThumbApi.scrollToY(-_scroll.y);
	};
	CMobileDelegateThumbnails.prototype.ScrollEnd = function(_scroll)
	{
		_scroll.manager.OnScrollAnimationEnd();
	};
	CMobileDelegateThumbnails.prototype.Drawing_OnMouseDown = function(e)
	{
		return this.Thumbnails.onMouseDown(e);
	};
	CMobileDelegateThumbnails.prototype.Drawing_OnMouseMove = function(e)
	{
		return this.Thumbnails.onMouseMove(e);
	};
	CMobileDelegateThumbnails.prototype.Drawing_OnMouseUp = function(e)
	{
		return this.Thumbnails.onMouseUp(e);
	};
	CMobileDelegateThumbnails.prototype.GetContextMenuType = function()
	{
		return AscCommon.MobileTouchContextMenuType.Slide;
	};
	CMobileDelegateThumbnails.prototype.GetContextMenuPosition = function()
	{
		return { X : 0, Y : 0 };
	};

	/**
	 * @extends {AscCommon.CMobileTouchManagerBase}
	 */
	function CMobileTouchManagerThumbnails(_config)
	{
		CMobileTouchManagerThumbnails.superclass.constructor.call(this, _config || {});

		this.SelectEnabled = false;
		this.TableTrackEnabled = false;
		this.ZoomEnabled = false;
	}
	AscCommon.extendClass(CMobileTouchManagerThumbnails, AscCommon.CMobileTouchManagerBase);

	CMobileTouchManagerThumbnails.prototype.Init = function(_api)
	{
		this.Api = _api;
		this.iScrollElement = "scroller_id_thumbnails";

		// создаем делегата. инициализация его - ПОСЛЕ создания iScroll
		this.delegate = new CMobileDelegateThumbnails(this);
		var _element = this.delegate.GetScrollerParent();
		this.CreateScrollerDiv(_element);

		this.iScroll = new window.IScroll(_element, {
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true,
			scrollX : true,
			scroller_id : this.iScrollElement,
			bounce : true
		});

		this.delegate.Init();
	};

	CMobileTouchManagerThumbnails.prototype.onTouchStart = function(e)
	{
		if (this.IsTouching)
			return;

		this.IsTouching = true;
		this.MoveAfterDown = false;

		var _e = e.touches ? e.touches[0] : e;

		AscCommon.check_MouseDownEvent(_e, false);
		this.DownPointOriginal.X = global_mouseEvent.X;
		this.DownPointOriginal.Y = global_mouseEvent.Y;

		this.TimeDown = new Date().getTime();

		this.Mode = AscCommon.MobileTouchMode.Scroll;
		this.iScroll._start(e);

		if (e.preventDefault)
			e.preventDefault();
		else
			e.returnValue = false;
		return false;
	};
	CMobileTouchManagerThumbnails.prototype.onTouchMove  = function(e)
	{
		if (!this.IsTouching)
		{
			AscCommon.stopEvent(e);
			return false;
		}

		var _e = e.touches ? e.touches[0] : e;

		if (!this.MoveAfterDown)
		{
			AscCommon.check_MouseMoveEvent(_e);
			if (Math.abs(this.DownPointOriginal.X - global_mouseEvent.X) > this.MoveMinDist ||
				Math.abs(this.DownPointOriginal.Y - global_mouseEvent.Y) > this.MoveMinDist)
			{
				this.MoveAfterDown = true;
			}
		}

		switch (this.Mode)
		{
			case AscCommon.MobileTouchMode.Scroll:
			{
				var _newTime = new Date().getTime();
				if ((_newTime - this.TimeDown) > this.ReadingGlassTime && !this.MoveAfterDown)
				{
					this.Mode = AscCommon.MobileTouchMode.FlowObj;
					this.delegate.Drawing_OnMouseDown(_e);
				}
				else
				{
					this.iScroll._move(e);
				}
				break;
			}
			case AscCommon.MobileTouchMode.FlowObj:
			{
				this.delegate.Drawing_OnMouseMove(_e);
				break;
			}
			default:
				break;
		}

		AscCommon.stopEvent(e);
		return false;
	};
	CMobileTouchManagerThumbnails.prototype.onTouchEnd   = function(e)
	{
		this.IsTouching = false;

		var _e = e.changedTouches ? e.changedTouches[0] : e;

		var isCheckContextMenuMode = false;
		switch (this.Mode)
		{
			case AscCommon.MobileTouchMode.Scroll:
			{
				this.iScroll._end(e);
				if (!this.MoveAfterDown)
				{
					global_mouseEvent.Button = 0;
					this.delegate.Drawing_OnMouseDown(_e);
					this.delegate.Drawing_OnMouseUp(_e);

					isCheckContextMenuMode = true;
				}
				break;
			}
			case AscCommon.MobileTouchMode.FlowObj:
			{
				this.delegate.Drawing_OnMouseUp(_e);
				break;
			}
			default:
				break;
		}

		this.delegate.HtmlPage.m_oThumbnails.HtmlElement.style.cursor = "default";

		this.Mode = AscCommon.MobileTouchMode.None;

		if (true !== this.iScroll.isAnimating)
			this.CheckContextMenuTouchEnd(isCheckContextMenuMode);

		AscCommon.stopEvent(e);
		return false;
	};

	//--------------------------------------------------------export----------------------------------------------------
	window['AscCommon']                          		= window['AscCommon'] || {};
	window['AscCommon'].CMobileTouchManager      		= CMobileTouchManager;
	window['AscCommon'].CMobileTouchManagerThumbnails   = CMobileTouchManagerThumbnails;
})(window);