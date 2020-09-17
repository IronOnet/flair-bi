package com.flair.bi.web.rest;

import com.flair.bi.domain.bookmarkwatch.BookmarkWatch;
import com.flair.bi.service.BookMarkWatchService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.dto.CountDTO;
import com.flair.bi.web.rest.util.PaginationUtil;
import com.querydsl.core.types.Predicate;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.querydsl.binding.QuerydslPredicate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookmarkWatchResource {

	private final BookMarkWatchService bookMarkWatchService;

	private final UserService userService;

	@GetMapping("/bookmark-watches")
	public ResponseEntity<List<BookmarkWatch>> getBookmarkWatchs(@ApiParam Pageable pageable,
			@QuerydslPredicate(root = BookmarkWatch.class) Predicate predicate) throws URISyntaxException {
		Page<BookmarkWatch> page = bookMarkWatchService.findAll(pageable, predicate);
		HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/bookmark-watches");
		return ResponseEntity.status(200).headers(headers).body(page.getContent());
	}

	@GetMapping("/bookmark-watches/recently-created/count")
	public ResponseEntity<CountDTO> getCreatedBookmarkWatchsCount() throws URISyntaxException {
		Integer count = bookMarkWatchService.getCreatedBookmarkCount();
		return ResponseEntity.status(200).body(new CountDTO(Long.valueOf(count)));
	}

}
