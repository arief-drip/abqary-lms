/* =====================================================================
   Al-Abqary LMS mockup — shared prototype interactions (vanilla, no deps)
   Load with: <script src="assets/mockup.js" defer></script>

   TABS
     <div data-tabs>
       <div class="tabs"><a class="tab tab--active" data-tab="a">A</a><a class="tab" data-tab="b">B</a></div>
       <div data-panel="a">…</div><div data-panel="b" hidden>…</div>
     </div>
     Toggles .tab--active + .is-active on [data-tab]; shows the matching [data-panel] (hidden attr).
     Nested [data-tabs] groups are isolated. Add data-tab-default="b" on the group to pick the initial tab,
     or open a tab via URL hash: page.html#tab-b (matches data-tab="b").

   MODALS
     <a data-open="modal-id">Open</a>
     <div class="modal-scrim overlay" id="modal-id"> <div class="modal">… <a data-close>Tutup</a></div></div>
     Adds/removes .is-open. Click on the scrim itself or press Escape also closes.

   CHOICE GROUPS (chip filters, segmented options, quiz options)
     <div data-chips> <span class="chip chip--active">Semua</span> <span class="chip">Nahwu</span> </div>
     Single-select by default; data-chips="multi" toggles each item independently.
     Items = .chip or [data-chip]. Active class = .chip--active (override with data-active-class="quiz-option--selected").
     .is-active is always toggled too.

   SIMPLE TOGGLE
     <span class="switch" data-toggle="is-on">…</span>   toggles the given class on the element itself.

   TOASTS
     <a data-toast="toast-id">Simpan</a> shows #toast-id (removes hidden) and auto-hides after 4s.
     [data-dismiss] inside a .toast (or any element) removes/hides its closest .toast / [data-dismissable].
   ===================================================================== */
(function () {
  "use strict";

  // Return elements matching selector that belong to this group (not to a nested group).
  function own(group, selector, groupAttr) {
    return Array.prototype.filter.call(group.querySelectorAll(selector), function (el) {
      return el.closest("[" + groupAttr + "]") === group;
    });
  }

  // ---------- Tabs ----------
  function activateTab(group, key) {
    own(group, "[data-tab]", "data-tabs").forEach(function (t) {
      var on = t.getAttribute("data-tab") === key;
      t.classList.toggle("tab--active", on);
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    own(group, "[data-panel]", "data-tabs").forEach(function (p) {
      p.hidden = p.getAttribute("data-panel") !== key;
    });
  }

  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = own(group, "[data-tab]", "data-tabs");
    if (!tabs.length) return;
    var hash = location.hash.replace(/^#tab-/, "");
    var keys = tabs.map(function (t) { return t.getAttribute("data-tab"); });
    var active = tabs.filter(function (t) { return t.classList.contains("tab--active"); })[0];
    var key = keys.indexOf(hash) > -1 ? hash
      : group.getAttribute("data-tab-default") || (active ? active.getAttribute("data-tab") : keys[0]);
    activateTab(group, key);
  });

  // Same-page links like "33-admin-dashboard.html#tab-transaksi" only change the hash (no reload).
  window.addEventListener("hashchange", function () {
    var hash = location.hash.replace(/^#tab-/, "");
    if (!hash) return;
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var match = own(group, "[data-tab]", "data-tabs").some(function (t) { return t.getAttribute("data-tab") === hash; });
      if (match) activateTab(group, hash);
    });
  });

  // ---------- Modals ----------
  function closeOverlay(el) { if (el) el.classList.remove("is-open"); }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.querySelectorAll(".overlay.is-open").forEach(closeOverlay);
  });

  // ---------- Toasts ----------
  function showToast(id) {
    var t = document.getElementById(id);
    if (!t) return;
    t.hidden = false;
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.hidden = true; }, 4000);
  }

  // ---------- Single delegated click handler ----------
  document.addEventListener("click", function (e) {
    var el;

    if ((el = e.target.closest("[data-tab]"))) {
      var group = el.closest("[data-tabs]");
      if (group) { e.preventDefault(); activateTab(group, el.getAttribute("data-tab")); return; }
    }

    if ((el = e.target.closest("[data-open]"))) {
      var target = document.getElementById(el.getAttribute("data-open"));
      if (target) { e.preventDefault(); target.classList.add("is-open"); return; }
    }

    if ((el = e.target.closest("[data-close]"))) {
      e.preventDefault(); closeOverlay(el.closest(".overlay")); return;
    }

    if (e.target.classList && e.target.classList.contains("overlay")) {
      closeOverlay(e.target); return;
    }

    if ((el = e.target.closest("[data-toast]"))) {
      e.preventDefault(); showToast(el.getAttribute("data-toast")); return;
    }

    if ((el = e.target.closest("[data-dismiss]"))) {
      var box = el.closest(".toast, [data-dismissable]");
      if (box) { e.preventDefault(); box.hidden = true; }
      return;
    }

    if ((el = e.target.closest("[data-chips] .chip, [data-chip]"))) {
      var chips = el.closest("[data-chips]");
      if (chips) {
        var cls = chips.getAttribute("data-active-class") || "chip--active";
        var items = own(chips, ".chip, [data-chip]", "data-chips");
        var multi = chips.getAttribute("data-chips") === "multi";
        var turnOn = multi ? !el.classList.contains("is-active") && !el.classList.contains(cls) : true;
        if (!multi) items.forEach(function (i) { i.classList.remove(cls, "is-active"); });
        el.classList.toggle(cls, turnOn);
        el.classList.toggle("is-active", turnOn);
        if (el.tagName === "A" && el.getAttribute("href") === "#") e.preventDefault();
        return;
      }
    }

    if ((el = e.target.closest("[data-toggle]"))) {
      el.classList.toggle(el.getAttribute("data-toggle"));
      if (el.tagName === "A") e.preventDefault();
    }
  });
})();
